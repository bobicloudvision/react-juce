/*
  ==============================================================================

    FontRegistry.cpp

  ==============================================================================
*/

#include "FontRegistry.h"

namespace reactjuce
{

juce::String FontRegistry::normalizeFamilyString(const juce::String& raw)
{
    juce::String s = raw.trim();

    if (s.isEmpty())
        return s;

    s = s.unquoted().trim();

    if (const int comma = s.indexOfChar(','); comma > 0)
        s = s.substring(0, comma).trim().unquoted();

    return s.trim();
}

FontRegistry& FontRegistry::getInstance()
{
    static FontRegistry instance;
    return instance;
}

void FontRegistry::registerFontMemory(const void* data, size_t numBytes)
{
    if (data == nullptr || numBytes == 0)
        return;

    auto tf = juce::Typeface::createSystemTypefaceFor(data, numBytes);
    if (tf == nullptr)
        return;

    const juce::ScopedLock lock(mutex);
    const juce::String primaryName = tf->getName();
    families[primaryName] = tf;

    // Variable fonts / odd metadata: family string may list multiple names
    if (const int comma = primaryName.indexOfChar(','); comma > 0)
    {
        const juce::String first = primaryName.substring(0, comma).trim();

        if (first.isNotEmpty())
            families[first] = tf;
    }
}

void FontRegistry::registerAlias(const juce::String& alias,
                                const juce::String& registeredFamilyName)
{
    const juce::ScopedLock lock(mutex);
    aliases[alias] = registeredFamilyName;
}

juce::Typeface::Ptr FontRegistry::lookupTypeface(const juce::String& familyOrAlias) const
{
    const juce::ScopedLock lock(mutex);

    juce::String key = normalizeFamilyString(familyOrAlias);

    auto aliasIt = aliases.find(key);
    if (aliasIt != aliases.end())
        key = aliasIt->second;

    auto direct = families.find(key);
    if (direct != families.end())
        return direct->second;

    for (const auto& kv : families)
        if (kv.first.equalsIgnoreCase(key))
            return kv.second;

    return nullptr;
}

} // namespace reactjuce
