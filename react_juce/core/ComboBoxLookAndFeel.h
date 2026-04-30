/*
==============================================================================

  ComboBoxLookAndFeel.h
  Styles juce::ComboBox + its PopupMenu from React props.

==============================================================================
*/

#pragma once

#include <juce_gui_basics/juce_gui_basics.h>

namespace reactjuce
{

class ComboBoxView;

//==============================================================================
class ComboBoxLookAndFeel final : public juce::LookAndFeel_V4
{
public:
    explicit ComboBoxLookAndFeel (ComboBoxView& ownerView);
    ~ComboBoxLookAndFeel() override;

    void applyFromProps (const juce::NamedValueSet& props, juce::ComboBox& combo);

    juce::Font getComboBoxFont (juce::ComboBox& box) override;
    juce::Font getPopupMenuFont() override;

    juce::PopupMenu::Options getOptionsForComboBoxPopupMenu (juce::ComboBox& box,
                                                             juce::Label& label) override;

    void drawComboBox (juce::Graphics& g, int width, int height, bool isButtonDown,
                       int buttonX, int buttonY, int buttonW, int buttonH,
                       juce::ComboBox& box) override;

    void drawPopupMenuBackground (juce::Graphics& g, int width, int height) override;

    void drawPopupMenuBackgroundWithOptions (juce::Graphics& g, int width, int height,
                                             const juce::PopupMenu::Options& options) override;

private:
    ComboBoxView& owner;

    juce::Font buildTriggerFont() const;
    juce::Font buildMenuFont() const;

    float getComboCornerSize (int width, int height) const;
    float getMenuCornerRadius() const;
    float getMenuBorderWidth() const;
    int   getMenuStandardItemHeight (int labelHeight) const;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (ComboBoxLookAndFeel)
};

} // namespace reactjuce
