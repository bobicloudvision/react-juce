/*
==============================================================================

  ComboBoxView.h
  Wraps juce::ComboBox for React-JUCE (native OS popup menu via LookAndFeel).

==============================================================================
*/

#pragma once

#include "View.h"

#include "ComboBoxLookAndFeel.h"

namespace reactjuce
{

//==============================================================================
/** Hosts juce::ComboBox — popup list is drawn by JUCE / the active LookAndFeel. */
class ComboBoxView final : public View
{
    friend class ComboBoxLookAndFeel;

public:
    static const inline juce::Identifier itemsProp       = "items";
    static const inline juce::Identifier valueProp       = "value";
    static const inline juce::Identifier placeholderProp = "placeholder";

    ComboBoxView();
    ~ComboBoxView() override;

    void setProperty (const juce::Identifier& name, const juce::var& value) override;
    void resized() override;

private:
    void rebuildItemsAndSelection();
    void dispatchSelectionChange();

    ComboBoxLookAndFeel lookAndFeel;
    juce::ComboBox combo;

    /** Parallel to ComboBox item ids 1…N — selection value string for each row. */
    juce::StringArray valuesByRow;

    bool suppressCallbacks = false;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (ComboBoxView)
};

} // namespace reactjuce
