/*
==============================================================================

  ComboBoxView.cpp

==============================================================================
*/

#include "ComboBoxView.h"

#include "TextView.h"

namespace reactjuce
{
    namespace
    {
        juce::var makeChangeEvent (const juce::String& value, int selectedIndex)
        {
            juce::DynamicObject::Ptr o = new juce::DynamicObject();
            o->setProperty ("value", value);
            o->setProperty ("selectedIndex", selectedIndex);
            return o.get();
        }
    } // namespace

    //==============================================================================
    ComboBoxView::ComboBoxView()
        : lookAndFeel (*this)
    {
        addAndMakeVisible (combo);
        combo.setTextWhenNoChoicesAvailable ("");
        combo.setScrollWheelEnabled (true);
        combo.setWantsKeyboardFocus (true);

        combo.setLookAndFeel (&lookAndFeel);
        lookAndFeel.applyFromProps (props, combo);

        combo.onChange = [this]
        {
            if (suppressCallbacks)
                return;

            dispatchSelectionChange();
        };
    }

    ComboBoxView::~ComboBoxView()
    {
        combo.setLookAndFeel (nullptr);
    }

    void ComboBoxView::setProperty (const juce::Identifier& name, const juce::var& value)
    {
        View::setProperty (name, value);

        if (name == itemsProp || name == valueProp || name == placeholderProp)
            rebuildItemsAndSelection();

        static const juce::Identifier editableProp ("editable");

        if (name == editableProp)
            combo.setEditableText (static_cast<bool> (value));

        lookAndFeel.applyFromProps (props, combo);

        const int justFlags = static_cast<int> (props.getWithDefault (TextView::justificationProp, 1));
        combo.setJustificationType (juce::Justification (justFlags));
    }

    void ComboBoxView::resized()
    {
        View::resized();
        combo.setBounds (getLocalBounds());
    }

    void ComboBoxView::rebuildItemsAndSelection()
    {
        suppressCallbacks = true;

        combo.clear (juce::dontSendNotification);
        valuesByRow.clear();

        if (props.contains (itemsProp))
        {
            const juce::var& itemsVar = props[itemsProp];

            if (itemsVar.isArray())
            {
                const auto* arr = itemsVar.getArray();

                if (arr != nullptr)
                {
                    int rowId = 1;

                    for (const auto& item : *arr)
                    {
                        if (item.isString())
                        {
                            const juce::String s (item.toString());
                            combo.addItem (s, rowId);
                            valuesByRow.add (s);
                        }
                        else if (item.isObject())
                        {
                            auto* obj = item.getDynamicObject();

                            if (obj != nullptr)
                            {
                                const juce::var valVar = obj->getProperty ("value");
                                const juce::var lblVar = obj->getProperty ("label");

                                const juce::String valStr (valVar.isVoid() ? lblVar.toString() : valVar.toString());
                                juce::String       lblStr (lblVar.toString());

                                if (lblStr.isEmpty())
                                    lblStr = valStr;

                                combo.addItem (lblStr, rowId);
                                valuesByRow.add (valStr);
                            }
                        }

                        ++rowId;
                    }
                }
            }
        }

        combo.setTextWhenNothingSelected (
            props.getWithDefault (placeholderProp, juce::var()).toString());

        // Controlled selection
        const juce::String desired (props.getWithDefault (valueProp, juce::var()).toString());

        int matchedId = 0;

        if (desired.isNotEmpty())
            for (int i = 0; i < valuesByRow.size(); ++i)
                if (valuesByRow[i] == desired)
                    matchedId = i + 1;

        combo.setSelectedId (matchedId, juce::dontSendNotification);

        suppressCallbacks = false;
    }

    void ComboBoxView::dispatchSelectionChange()
    {
        const int id = combo.getSelectedId();

        if (id <= 0 || id > valuesByRow.size())
            return;

        dispatchViewEvent ("onChange", makeChangeEvent (valuesByRow[id - 1], id - 1));
    }

} // namespace reactjuce
