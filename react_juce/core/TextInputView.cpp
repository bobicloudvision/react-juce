/*
==============================================================================

  TextInputView.cpp
  Created: 20 Jan 2021 10:30pm

==============================================================================
*/

#include "TextInputView.h"
#include "TextView.h"

namespace reactjuce
{
    namespace detail
    {
        static juce::var makeInputEventObject(const juce::String &value)
        {
            juce::DynamicObject::Ptr obj = new juce::DynamicObject();
            obj->setProperty("value", value);
            return obj.get();
        }

        static juce::var makeChangeEventObject(const juce::String &value)
        {
            juce::DynamicObject::Ptr obj = new juce::DynamicObject();
            obj->setProperty("value", value);
            return obj.get();
        }
    }

    void TextInputView::TextInput::setControlledValue(const juce::String &value)
    {
        insertedAsControlledValue = true;
        setText(value);
    }

    void TextInputView::TextInput::setMaxLength(int maxLen)
    {
        maxLength = maxLen;
        setInputRestrictions(maxLen);
    }

    void TextInputView::TextInput::setPlaceholderText(const juce::String &text)
    {
        placeholderText = text;
        setTextToShowWhenEmpty(placeholderText, placeholderColour);
    }

    void TextInputView::TextInput::setPlaceholderColour(const juce::Colour &colourToUse)
    {
        placeholderColour = colourToUse;
        setTextToShowWhenEmpty(placeholderText, placeholderColour);
    }

    void TextInputView::TextInput::insertTextAtCaret(const juce::String &textToInsert)
    {
        const juce::String currentValue = getText();
        juce::TextEditor::insertTextAtCaret(textToInsert);
        const juce::String newValue = getText();
        if (currentValue == newValue)
        {
            return;
        }

        // Invoke JavaScript's `input` event.
        if (props.contains(TextInputView::onInputProp) && props[TextInputView::onInputProp].isMethod())
        {
            std::array<juce::var, 1> args{{detail::makeInputEventObject(newValue)}};
            juce::var::NativeFunctionArgs nfArgs(juce::var(), args.data(), static_cast<int>(args.size()));
            std::invoke(props[TextInputView::onInputProp].getNativeFunction(), nfArgs);
        }

        dirty = true;

        if (controlled && !insertedAsControlledValue)
        {
            undo();
        }
        insertedAsControlledValue = false;
    }

    //==============================================================================

    void TextInputView::TextInput::textEditorReturnKeyPressed(juce::TextEditor &)
    {
        invokeChangeEventIfNeeded();
    }

    void TextInputView::TextInput::textEditorFocusLost(juce::TextEditor &)
    {
        invokeChangeEventIfNeeded();
    }

    void TextInputView::TextInput::invokeChangeEventIfNeeded()
    {
        if (dirty)
        {
            // Invoke JavaScript's `change` event.
            if (props.contains(TextInputView::onChangeProp) && props[TextInputView::onChangeProp].isMethod())
            {
                std::array<juce::var, 1> args{{detail::makeChangeEventObject(getText())}};
                juce::var::NativeFunctionArgs nfArgs(juce::var(), args.data(), static_cast<int>(args.size()));
                std::invoke(props[TextInputView::onChangeProp].getNativeFunction(), nfArgs);
            }
            dirty = false;
        }
    }

    //==============================================================================

    TextInputView::TextInputView()
        : textInput(props)
    {
        addAndMakeVisible(textInput);
        textInput.addListener(&textInput);
        textInput.setPopupMenuEnabled(false);
        textInput.setIndents(0, 0);
    }

    void TextInputView::layoutTextEditorBounds()
    {
        textInput.setBounds(getTextInputContentBounds());
    }

    juce::Rectangle<int> TextInputView::getTextInputContentBounds()
    {
        auto b = getLocalBounds();
        if (b.isEmpty())
            return b;

        const float refW = juce::jmax (1.0f, cachedFloatBounds.getWidth());

        float pl = 0.0f, pt = 0.0f, pr = 0.0f, pb = 0.0f;

        if (props.contains("padding"))
        {
            const float p = getResolvedLengthProperty("padding", refW);
            pl = pt = pr = pb = p;
        }

        if (props.contains("paddingHorizontal") || props.contains("padding-horizontal"))
        {
            const float x = props.contains("paddingHorizontal")
                ? getResolvedLengthProperty("paddingHorizontal", refW)
                : getResolvedLengthProperty("padding-horizontal", refW);
            pl = pr = x;
        }

        if (props.contains("paddingVertical") || props.contains("padding-vertical"))
        {
            const float x = props.contains("paddingVertical")
                ? getResolvedLengthProperty("paddingVertical", refW)
                : getResolvedLengthProperty("padding-vertical", refW);
            pt = pb = x;
        }

        if (props.contains("paddingLeft") || props.contains("padding-left"))
            pl = props.contains("paddingLeft")
                ? getResolvedLengthProperty("paddingLeft", refW)
                : getResolvedLengthProperty("padding-left", refW);

        if (props.contains("paddingRight") || props.contains("padding-right"))
            pr = props.contains("paddingRight")
                ? getResolvedLengthProperty("paddingRight", refW)
                : getResolvedLengthProperty("padding-right", refW);

        if (props.contains("paddingTop") || props.contains("padding-top"))
            pt = props.contains("paddingTop")
                ? getResolvedLengthProperty("paddingTop", refW)
                : getResolvedLengthProperty("padding-top", refW);

        if (props.contains("paddingBottom") || props.contains("padding-bottom"))
            pb = props.contains("paddingBottom")
                ? getResolvedLengthProperty("paddingBottom", refW)
                : getResolvedLengthProperty("padding-bottom", refW);

        const int il = juce::roundToInt(pl);
        const int it = juce::roundToInt(pt);
        const int ir = juce::roundToInt(pr);
        const int ib = juce::roundToInt(pb);

        const int w = juce::jmax(0, b.getWidth() - il - ir);
        const int h = juce::jmax(0, b.getHeight() - it - ib);
        return { b.getX() + il, b.getY() + it, w, h };
    }

    //==============================================================================

    void TextInputView::setProperty(const juce::Identifier &name, const juce::var &value)
    {
        View::setProperty(name, value);
        if (name == valueProp)
        {
            if (!value.isString())
                throw std::invalid_argument("Invalid prop value. Prop \'value\' must be a string.");

            textInput.setControlled(true);
            textInput.setControlledValue(value);
        }

        if (name == placeholderProp)
        {
            if (!value.isString())
                throw std::invalid_argument("Invalid prop value. Prop \'placeholder\' must be a string.");

            textInput.setPlaceholderText(value);
        }

        if (name == placeholderColorProp)
        {
            if (!value.isString())
                throw std::invalid_argument("Invalid prop value. Prop \'placeholder-color\' must be a color string.");

            const juce::String hexPlaceholderColor = value;
            const juce::Colour placeholderColor = juce::Colour::fromString(hexPlaceholderColor);
            textInput.setPlaceholderColour(placeholderColor);
        }

        if (name == maxlengthProp)
        {
            if (!value.isDouble())
              throw std::invalid_argument("Invalid prop value. Prop \'maxlength\' must be a number.");

            textInput.setMaxLength(value);
        }

        if (name == readonly)
        {
            textInput.setReadOnly(value);
        }

        textInput.applyFontToAllText(getFont());

        const juce::String hexColor = props.getWithDefault(colorProp, "ff000000");
        const juce::Colour colour = juce::Colour::fromString(hexColor);
        textInput.applyColourToAllText(colour);

        const int just = props.getWithDefault(justificationProp, 1);
        textInput.setJustification(just);

        if (isTextEditorColorProp(name))
            setTextEditorColorProp(name, value);
    }

    void TextInputView::resized()
    {
        View::resized();
        layoutTextEditorBounds();
    }

    juce::Font TextInputView::getFont() const
    {
        return TextView::getFont(props);
    }

    bool TextInputView::isTextEditorColorProp(const juce::Identifier &textEditorColorProp)
    {
        const auto it = textEditorColourIdsByProp.find(textEditorColorProp);
        return it != textEditorColourIdsByProp.end();
    }

    void TextInputView::setTextEditorColorProp(const juce::Identifier &textEditorColorProp, const juce::var &value)
    {
        if (!value.isString())
        {
            const std::string propName = textEditorColorProp.toString().toStdString();
            const std::string message = "Invalid prop value. Prop \'" + propName + "\' must be a color string.";
            throw std::invalid_argument(message);
        }

        const juce::String hexColor = value;
        const juce::Colour color = juce::Colour::fromString(hexColor);
        textInput.setColour(textEditorColourIdsByProp.at(textEditorColorProp), color);
    }

    const std::map<juce::Identifier, int> TextInputView::textEditorColourIdsByProp = {
        { backgroundColorProp,      juce::TextEditor::ColourIds::backgroundColourId },
        { outlineColorProp,         juce::TextEditor::ColourIds::outlineColourId },
        { focusedOutlineColorProp,  juce::TextEditor::ColourIds::focusedOutlineColourId },
        { highlightedTextColorProp, juce::TextEditor::ColourIds::highlightedTextColourId },
        { highlightColorProp,       juce::TextEditor::ColourIds::highlightColourId },
        { caretColorProp,           juce::CaretComponent::ColourIds::caretColourId }
    };
}
