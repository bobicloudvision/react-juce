/*
==============================================================================

  ComboBoxLookAndFeel.cpp

==============================================================================
*/

#include "ComboBoxLookAndFeel.h"

#include "ComboBoxView.h"
#include "TextView.h"
#include "View.h"

namespace reactjuce
{

    namespace
    {
        static juce::Colour colourFromProp (const juce::NamedValueSet& p,
                                            const juce::Identifier& key,
                                            const juce::Colour& fallback)
        {
            if (! p.contains (key))
                return fallback;

            return juce::Colour::fromString (p[key].toString());
        }
    } // namespace

    //==============================================================================
    ComboBoxLookAndFeel::ComboBoxLookAndFeel (ComboBoxView& ownerView)
        : owner (ownerView)
    {
    }

    ComboBoxLookAndFeel::~ComboBoxLookAndFeel() = default;

    void ComboBoxLookAndFeel::applyFromProps (const juce::NamedValueSet& p, juce::ComboBox& combo)
    {
        using CB = juce::ComboBox;
        using PM = juce::PopupMenu;

        static const juce::Identifier outlineColorProp ("outline-color");
        static const juce::Identifier arrowColorProp ("arrow-color");
        static const juce::Identifier focusedOutlineProp ("focused-outline-color");
        static const juce::Identifier buttonColorProp ("button-color");

        static const juce::Identifier menuBg ("menu-background-color");
        static const juce::Identifier menuText ("menu-color");
        static const juce::Identifier menuHiBg ("menu-highlight-background-color");
        static const juce::Identifier menuHiText ("menu-highlight-color");
        static const juce::Identifier menuHeader ("menu-header-color");

        combo.setColour (CB::textColourId,
                         colourFromProp (p, TextView::colorProp, juce::Colours::black));

        if (p.contains (View::backgroundColorProp))
            combo.setColour (CB::backgroundColourId,
                             colourFromProp (p, View::backgroundColorProp, juce::Colours::white));

        if (p.contains (outlineColorProp))
            combo.setColour (CB::outlineColourId, colourFromProp (p, outlineColorProp, juce::Colours::grey));
        else if (p.contains (View::borderColorProp))
            combo.setColour (CB::outlineColourId, colourFromProp (p, View::borderColorProp, juce::Colours::grey));

        if (p.contains (arrowColorProp))
            combo.setColour (CB::arrowColourId, colourFromProp (p, arrowColorProp, juce::Colours::black));

        if (p.contains (focusedOutlineProp))
            combo.setColour (CB::focusedOutlineColourId,
                             colourFromProp (p, focusedOutlineProp, juce::Colours::grey));

        if (p.contains (buttonColorProp))
            combo.setColour (CB::buttonColourId, colourFromProp (p, buttonColorProp, juce::Colours::grey));

        if (p.contains (menuBg))
            setColour (PM::backgroundColourId, colourFromProp (p, menuBg, juce::Colours::white));

        if (p.contains (menuText))
            setColour (PM::textColourId, colourFromProp (p, menuText, juce::Colours::black));

        if (p.contains (menuHiBg))
            setColour (PM::highlightedBackgroundColourId,
                       colourFromProp (p, menuHiBg, juce::Colours::lightblue));

        if (p.contains (menuHiText))
            setColour (PM::highlightedTextColourId,
                       colourFromProp (p, menuHiText, juce::Colours::black));

        if (p.contains (menuHeader))
            setColour (PM::headerTextColourId, colourFromProp (p, menuHeader, juce::Colours::grey));
    }

    juce::Font ComboBoxLookAndFeel::buildTriggerFont() const
    {
        return TextView::getFont (owner.props);
    }

    juce::Font ComboBoxLookAndFeel::buildMenuFont() const
    {
        const auto& p = owner.props;

        juce::NamedValueSet m;

        static const juce::Identifier menuFs ("menu-font-size");
        static const juce::Identifier menuFf ("menu-font-family");
        static const juce::Identifier menuSt ("menu-font-style");

        if (p.contains (menuFs))
            m.set (TextView::fontSizeProp, p[menuFs]);
        else if (p.contains (TextView::fontSizeProp))
            m.set (TextView::fontSizeProp, p[TextView::fontSizeProp]);

        if (p.contains (menuFf))
            m.set (TextView::fontFamilyProp, p[menuFf]);
        else if (p.contains (TextView::fontFamilyProp))
            m.set (TextView::fontFamilyProp, p[TextView::fontFamilyProp]);

        if (p.contains (menuSt))
            m.set (TextView::fontStyleProp, p[menuSt]);
        else if (p.contains (TextView::fontStyleProp))
            m.set (TextView::fontStyleProp, p[TextView::fontStyleProp]);

        if (m.size() == 0)
            return TextView::getFont (owner.props);

        return TextView::getFont (m);
    }

    float ComboBoxLookAndFeel::getComboCornerSize (int width, int height) const
    {
        if (owner.props.contains (View::borderRadiusProp))
            return owner.getResolvedLengthProperty (View::borderRadiusProp.toString(),
                                                    (float) juce::jmin (width, height));

        return 3.0f;
    }

    float ComboBoxLookAndFeel::getMenuCornerRadius() const
    {
        static const juce::Identifier mbr ("menu-border-radius");

        if (owner.props.contains (mbr))
            return static_cast<float> (owner.props[mbr]);

        return 0.0f;
    }

    float ComboBoxLookAndFeel::getMenuBorderWidth() const
    {
        static const juce::Identifier mbw ("menu-border-width");

        if (owner.props.contains (mbw))
            return static_cast<float> (owner.props[mbw]);

        return 0.0f;
    }

    int ComboBoxLookAndFeel::getMenuStandardItemHeight (int labelHeight) const
    {
        static const juce::Identifier mih ("menu-item-height");

        if (owner.props.contains (mih))
            return juce::roundToInt (owner.props[mih]);

        const int fromFont = juce::roundToInt (buildMenuFont().getHeight() * 1.35f);
        return juce::jmax (labelHeight, fromFont);
    }

    juce::Font ComboBoxLookAndFeel::getComboBoxFont (juce::ComboBox&)
    {
        return buildTriggerFont();
    }

    juce::Font ComboBoxLookAndFeel::getPopupMenuFont()
    {
        return buildMenuFont();
    }

    juce::PopupMenu::Options ComboBoxLookAndFeel::getOptionsForComboBoxPopupMenu (juce::ComboBox& box,
                                                                                    juce::Label& label)
    {
        return juce::PopupMenu::Options().withTargetComponent (&box)
            .withItemThatMustBeVisible (box.getSelectedId())
            .withMinimumWidth (box.getWidth())
            .withMaximumNumColumns (1)
            .withStandardItemHeight (getMenuStandardItemHeight (label.getHeight()));
    }

    void ComboBoxLookAndFeel::drawComboBox (juce::Graphics& g, int width, int height, bool,
                                            int, int, int, int, juce::ComboBox& box)
    {
        const float corner = getComboCornerSize (width, height);
        const auto boxBounds = juce::Rectangle<float> (0.0f, 0.0f, (float) width, (float) height);

        g.setColour (box.findColour (juce::ComboBox::backgroundColourId));
        g.fillRoundedRectangle (boxBounds, corner);

        float lineW = 1.0f;
        static const juce::Identifier outlineWidthProp ("outline-width");

        if (owner.props.contains (outlineWidthProp))
            lineW = juce::jmax (0.5f, static_cast<float> (owner.props[outlineWidthProp]));
        else if (owner.props.contains (View::borderWidthProp))
            lineW = juce::jmax (0.5f,
                                owner.getResolvedLengthProperty (View::borderWidthProp.toString(),
                                                                 (float) juce::jmin (width, height)));

        g.setColour (box.findColour (juce::ComboBox::outlineColourId));
        g.drawRoundedRectangle (boxBounds.reduced (0.5f, 0.5f), corner, lineW);

        juce::Rectangle<int> arrowZone (width - 30, 0, 20, height);
        juce::Path path;
        path.startNewSubPath ((float) arrowZone.getX() + 3.0f, (float) arrowZone.getCentreY() - 2.0f);
        path.lineTo ((float) arrowZone.getCentreX(), (float) arrowZone.getCentreY() + 3.0f);
        path.lineTo ((float) arrowZone.getRight() - 3.0f, (float) arrowZone.getCentreY() - 2.0f);

        g.setColour (box.findColour (juce::ComboBox::arrowColourId)
                         .withAlpha (box.isEnabled() ? 0.9f : 0.2f));
        g.strokePath (path, juce::PathStrokeType (2.0f));
    }

    void ComboBoxLookAndFeel::drawPopupMenuBackground (juce::Graphics& g, int width, int height)
    {
        drawPopupMenuBackgroundWithOptions (g, width, height, juce::PopupMenu::Options());
    }

    void ComboBoxLookAndFeel::drawPopupMenuBackgroundWithOptions (juce::Graphics& g,
                                                                  int width,
                                                                  int height,
                                                                  const juce::PopupMenu::Options&)
    {
        const float       radius = getMenuCornerRadius();
        const juce::Colour bg    = findColour (juce::PopupMenu::backgroundColourId);

        g.setColour (bg);

        const auto r = juce::Rectangle<float> (0.0f, 0.0f, (float) width, (float) height);

        if (radius > 0.5f)
            g.fillRoundedRectangle (r, radius);
        else
            g.fillAll (bg);

        const float bw = getMenuBorderWidth();

        if (bw <= 0.0f)
            return;

        static const juce::Identifier menuBorderColorProp ("menu-border-color");

        const juce::Colour borderCol = owner.props.contains (menuBorderColorProp)
                                           ? juce::Colour::fromString (owner.props[menuBorderColorProp].toString())
                                           : findColour (juce::PopupMenu::textColourId).withAlpha (0.35f);

        g.setColour (borderCol);

        if (radius > 0.5f)
            g.drawRoundedRectangle (r.reduced (bw * 0.5f, bw * 0.5f), juce::jmax (0.0f, radius - bw * 0.5f), bw);
        else
            g.drawRect (juce::Rectangle<int> (0, 0, width, height), juce::roundToInt (bw));
    }

} // namespace reactjuce
