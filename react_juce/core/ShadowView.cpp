#include "ShadowView.h"

//TODO: Eventually we may switch this out based on some preprocessor
//      flag just as we're doing with EcmascriptEngine.
#include "ShadowView_Yoga.cpp"

namespace reactjuce
{
    //==============================================================================
    ShadowView::ShadowView(View* _view)
        : shadowViewPimpl(std::make_unique<ShadowViewPimpl>(_view))
    {
    }

    ShadowView::~ShadowView()
    {
    }

    //==============================================================================
    bool ShadowView::setProperty (const juce::String& name, const juce::var& newValue)
    {
        return shadowViewPimpl->setProperty(name, newValue);
    }

    //==============================================================================
    void ShadowView::addChild (ShadowView* childView, int index)
    {
       shadowViewPimpl->addChild(childView, index);
    }

    void ShadowView::removeChild (ShadowView* childView)
    {
        shadowViewPimpl->removeChild(childView);
    }

    //==============================================================================
    View* ShadowView::getAssociatedView()
    {
        return shadowViewPimpl->getAssociatedView();
    }

    //==============================================================================
    juce::Rectangle<float> ShadowView::getCachedLayoutBounds()
    {
        return shadowViewPimpl->getCachedLayoutBounds();
    }

    void ShadowView::computeViewLayout(const float width, const float height)
    {
        shadowViewPimpl->computeViewLayout(width, height);
    }

    void ShadowView::flushViewLayout()
    {
        shadowViewPimpl->flushViewLayout();
    }

    void ShadowView::flushViewLayoutAnimated(double const durationMs,
                                             int const frameRate,
                                             BoundsAnimator::EasingType const et)
    {
        shadowViewPimpl->flushViewLayoutAnimated(durationMs, frameRate, et);
    }

    //==============================================================================
    std::vector<ShadowView*>& ShadowView::getChildren()
    {
       return shadowViewPimpl->children;
    }

    //==============================================================================
    ShadowView::ShadowViewPimpl& ShadowView::getShadowViewImpl() { return *shadowViewPimpl; }

    //==============================================================================
    float ShadowView::getZIndex() const
    {
        const auto& p = shadowViewPimpl->props;

        juce::var z = p["z-index"];

        if (z.isVoid() || z.isUndefined())
            z = p["zIndex"];

        if (z.isDouble() || z.isInt() || z.isInt64())
            return static_cast<float> (z);

        if (z.isString())
            return z.toString().getFloatValue();

        return 0.f;
    }

    //==============================================================================

}
