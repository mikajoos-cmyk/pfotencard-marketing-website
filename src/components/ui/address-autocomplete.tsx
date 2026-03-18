import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressSuggestion {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: {
    street: string;
    city: string;
    postcode: string;
    country: string;
    countryCode?: string;
  }) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const AddressAutocomplete = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = 'Adresse eingeben...',
  className,
  id,
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Use Nominatim API (OpenStreetMap) - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'de',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (error) {
      console.error('Address search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchAddress(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    const address = suggestion.address;
    const street = address.road 
      ? `${address.road}${address.house_number ? ` ${address.house_number}` : ''}`
      : '';
    const city = address.city || address.town || address.village || address.municipality || '';
    const country = address.country || '';
    const countryCode = address.country_code?.toUpperCase() || '';
    const postcode = address.postcode || '';

    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);

    if (onAddressSelect) {
      onAddressSelect({ street, city, postcode, country, countryCode });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn('pr-10', className)}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => {
            const address = suggestion.address;
            const street = address.road 
              ? `${address.road}${address.house_number ? ` ${address.house_number}` : ''}`
              : '';
            const city = address.city || address.town || address.village || '';
            const country = address.country || '';

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-start gap-2',
                  index === selectedIndex && 'bg-muted',
                  index === 0 && 'rounded-t-lg',
                  index === suggestions.length - 1 && 'rounded-b-lg'
                )}
              >
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{street || suggestion.display_name.split(',')[0]}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {city && `${city}, `}{country}
                  </div>
                </div>
              </button>
            );
          })}
          <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-t border-border bg-muted/50">
            Powered by OpenStreetMap
          </div>
        </div>
      )}
    </div>
  );
};
