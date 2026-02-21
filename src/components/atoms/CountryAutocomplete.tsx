import { QUIZ_COUNTRIES } from '@/utils/countryUtils';
import React, { useEffect, useRef, useState } from 'react';

interface CountryAutocompleteProps {
    onSubmit: (countryName: string) => void;
    disabled?: boolean;
}

export const CountryAutocomplete: React.FC<CountryAutocompleteProps> = ({ onSubmit, disabled }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter suggestions based on input
    useEffect(() => {
        if (inputValue.trim()) {
            const lowerInput = inputValue.toLowerCase();
            const filtered = QUIZ_COUNTRIES.filter(country =>
                country.toLowerCase().startsWith(lowerInput)
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [inputValue]);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Find exact match or use the input value (which might be wrong, but we let handleGuess deal with it)
        const match = QUIZ_COUNTRIES.find(c => c.toLowerCase() === inputValue.toLowerCase());
        const valueToSubmit = match ? match : inputValue;

        if (valueToSubmit.trim()) {
            onSubmit(valueToSubmit.trim());
            setInputValue(''); // Clear after submit
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        // We pass the suggestion directly to avoid waiting for state update
        onSubmit(suggestion);
        setInputValue('');
        setShowSuggestions(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <label htmlFor="country-input" className="text-sm font-semibold text-slate-300">
                    Type country name:
                </label>
                <div className="flex gap-2">
                    <input
                        id="country-input"
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => { if (inputValue.trim()) setShowSuggestions(true); }}
                        disabled={disabled}
                        placeholder="e.g. France"
                        className="w-full flex-1 rounded-lg border border-slate-600 bg-slate-700 p-3 text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        disabled={disabled || !inputValue.trim()}
                        className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500"
                    >
                        Guess
                    </button>
                </div>
            </form>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-600 bg-slate-800 shadow-xl scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                    {suggestions.map((suggestion) => (
                        <li key={suggestion}>
                            <button
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 py-2 text-left text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
                            >
                                {suggestion}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
