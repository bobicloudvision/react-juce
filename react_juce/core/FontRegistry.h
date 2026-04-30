/*
  ==============================================================================

    FontRegistry.h
    Register embedded fonts (TTF/OTF bytes) so JSX/Canvas font-family matches.

  ==============================================================================
*/

#pragma once

#include <map>

#include <juce_graphics/juce_graphics.h>

namespace reactjuce
{

/**
 * Holds typefaces loaded from memory. Call registerFontMemory() from plugin startup
 * (or before opening the React bundle), then use font-family in JS with the typeface
 * family name from the font file (see lookupTypeface).
 */
class FontRegistry
{
public:
    static FontRegistry& getInstance();

    /** Normalizes JS/CSS font-family (quotes, first stack entry). Use before lookup. */
    static juce::String normalizeFamilyString(const juce::String& raw);

    /** Loads a font from embedded binary data and indexes it by typeface family name. */
    void registerFontMemory(const void* data, size_t numBytes);

    /** Optional alias (e.g. "Display Sans") -> registered family name from the font file. */
    void registerAlias(const juce::String& alias, const juce::String& registeredFamilyName);

    /** Resolve a font-family string against embedded fonts; nullptr if not registered. */
    juce::Typeface::Ptr lookupTypeface(const juce::String& familyOrAlias) const;

private:
    FontRegistry() = default;

    mutable juce::CriticalSection mutex;
    std::map<juce::String, juce::Typeface::Ptr> families;
    std::map<juce::String, juce::String> aliases;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(FontRegistry)
};

} // namespace reactjuce
