#include "ShadowView.h"
#include "YogaImplInclude.cpp"

#include <algorithm>


//==============================================================================
#define BP_SPREAD_SETTER_PERCENT(setter) setter, setter##Percent
#define BP_SPREAD_SETTER_AUTO(setter) BP_SPREAD_SETTER_PERCENT(setter), setter##Auto

//==============================================================================

namespace reactjuce
{
    void layout_detail::expandViewBoundsForOutOfFlowChildren (View* view,
                                                             const std::vector<ShadowView*>& children)
    {
        if (view == nullptr || children.empty())
            return;

        auto localUnion = juce::Rectangle<int> (0, 0, view->getWidth(), view->getHeight());

        for (auto* sv : children)
            if (sv != nullptr)
                if (auto* cv = sv->getAssociatedView())
                    localUnion = localUnion.getUnion (cv->getBounds());

        const auto b = view->getBounds();

        const int nw = juce::jmax (b.getWidth(), localUnion.getWidth());
        const int nh = juce::jmax (b.getHeight(), localUnion.getHeight());

        if (nw == b.getWidth() && nh == b.getHeight())
            return;

        const auto nb = b.withSize (nw, nh);
        view->setBounds (nb);
        view->setFloatBounds (nb.toFloat());
    }

    namespace
    {
        //==============================================================================
        template <typename Setter, typename ...Args>
        const auto getYogaNodeFloatSetter(Setter setter, Args... args) {
            return [=](const juce::var& value, YGNodeRef node) {
                if(value.isDouble()) {
                    setter(node, args..., (float) value);
                    return true;
                }
                return false;
            };
        }

        template <typename Setter, typename SetterPercent, typename ...Args>
        const auto getYogaNodeDimensionSetter(Setter setter, SetterPercent setterPercent, Args... args) {
            return [=, floatSetter = getYogaNodeFloatSetter(setter, args...)](const juce::var& value, YGNodeRef node) {
                if (floatSetter(value, node))
                    return true;
                if (value.isString() && value.toString().contains("%"))
                {
                    juce::String strVal = value.toString().retainCharacters("-1234567890.");
                    setterPercent(node, args..., strVal.getFloatValue());
                    return true;
                }
                setter(node, args..., YGUndefined);
                return true;
            };
        }

        template <typename Setter, typename SetterPercent, typename SetterAuto, typename ...Args>
        const auto getYogaNodeDimensionAutoSetter(Setter setter, SetterPercent setterPercent, SetterAuto setterAuto, Args... args) {
            return [=, nonAutoSetter = getYogaNodeDimensionSetter(setter, setterPercent, args...)](const juce::var& value, YGNodeRef node) {
                if (value.isString() && value.toString() == "auto") {
                    setterAuto(node, args...);
                    return true;
                }
                return nonAutoSetter(value, node);
            };
        }

        template <typename Setter, typename EnumMap>
        const auto getYogaNodeEnumSetter(Setter setter, EnumMap &map) {
            return [=](const juce::var& value, YGNodeRef node) {                       \
        const auto val = map.find(value);
                if(val == map.end()) {
                    // TODO catch further up to add the key at which we tried
                    // to set this enum property to the message and rethrow
                    throw std::invalid_argument("Invalid property: " + value.toString().toStdString());
                }
                setter(node, val->second);
                return true;
            };
        }

        //==============================================================================
        std::unordered_map<juce::String, YGDirection> ValidDirectionValues {
            { YGDirectionToString(YGDirectionInherit), YGDirectionInherit },
            { YGDirectionToString(YGDirectionLTR), YGDirectionLTR },
            { YGDirectionToString(YGDirectionRTL), YGDirectionRTL },
        };

        std::unordered_map<juce::String, YGFlexDirection> ValidFlexDirectionValues {
            { YGFlexDirectionToString(YGFlexDirectionColumn), YGFlexDirectionColumn },
            { YGFlexDirectionToString(YGFlexDirectionColumnReverse), YGFlexDirectionColumnReverse },
            { YGFlexDirectionToString(YGFlexDirectionRow), YGFlexDirectionRow },
            { YGFlexDirectionToString(YGFlexDirectionRowReverse), YGFlexDirectionRowReverse },
        };

        std::unordered_map<juce::String, YGJustify> ValidJustifyValues {
            { YGJustifyToString(YGJustifyFlexStart), YGJustifyFlexStart },
            { YGJustifyToString(YGJustifyCenter), YGJustifyCenter },
            { YGJustifyToString(YGJustifyFlexEnd), YGJustifyFlexEnd },
            { YGJustifyToString(YGJustifySpaceBetween), YGJustifySpaceBetween },
            { YGJustifyToString(YGJustifySpaceAround), YGJustifySpaceAround },
        };

        std::unordered_map<juce::String, YGAlign> ValidAlignValues {
            { YGAlignToString(YGAlignAuto), YGAlignAuto },
            { YGAlignToString(YGAlignFlexStart), YGAlignFlexStart },
            { YGAlignToString(YGAlignCenter), YGAlignCenter },
            { YGAlignToString(YGAlignFlexEnd), YGAlignFlexEnd },
            { YGAlignToString(YGAlignStretch), YGAlignStretch },
            { YGAlignToString(YGAlignBaseline), YGAlignBaseline },
            { YGAlignToString(YGAlignSpaceBetween), YGAlignSpaceBetween },
            { YGAlignToString(YGAlignSpaceAround), YGAlignSpaceAround },
        };

        std::unordered_map<juce::String, YGPositionType> ValidPositionTypeValues {
            { YGPositionTypeToString(YGPositionTypeRelative), YGPositionTypeRelative },
            { YGPositionTypeToString(YGPositionTypeAbsolute), YGPositionTypeAbsolute },
        };

        std::unordered_map<juce::String, YGWrap> ValidFlexWrapValues {
            { YGWrapToString(YGWrapNoWrap), YGWrapNoWrap },
            { YGWrapToString(YGWrapWrap), YGWrapWrap },
            { YGWrapToString(YGWrapWrapReverse), YGWrapWrapReverse },
        };

        std::unordered_map<juce::String, YGOverflow> ValidOverflowValues {
            { YGOverflowToString(YGOverflowVisible), YGOverflowVisible },
            { YGOverflowToString(YGOverflowHidden), YGOverflowHidden },
            { YGOverflowToString(YGOverflowScroll), YGOverflowScroll },
        };

        //==============================================================================
        class PropertySetterMap {
            using K = juce::String;
            using V = juce::var;
            using F = std::function<bool(const V&, YGNodeRef)>;
            std::unordered_map<K, F> propertySetters;

        public:
            PropertySetterMap(std::initializer_list<std::pair<const K, F>> init): propertySetters(init) {}
            bool call(const K& key, const V& v, YGNodeRef node) const {
                const auto setter = propertySetters.find(key);
                if(setter == propertySetters.end()) {
                    return false;
                }
                return setter->second(v, node);
            }
        };

        static const PropertySetterMap propertySetters{
            {"direction", getYogaNodeEnumSetter(YGNodeStyleSetDirection, ValidDirectionValues)},
            {"flex-direction", getYogaNodeEnumSetter(YGNodeStyleSetFlexDirection, ValidFlexDirectionValues)},
            {"justify-content", getYogaNodeEnumSetter(YGNodeStyleSetJustifyContent, ValidJustifyValues)},
            {"align-items", getYogaNodeEnumSetter(YGNodeStyleSetAlignItems, ValidAlignValues)},
            {"align-content", getYogaNodeEnumSetter(YGNodeStyleSetAlignContent, ValidAlignValues)},
            {"align-self", getYogaNodeEnumSetter(YGNodeStyleSetAlignSelf, ValidAlignValues)},
            {"position", getYogaNodeEnumSetter(YGNodeStyleSetPositionType, ValidPositionTypeValues)},
            {"flex-wrap", getYogaNodeEnumSetter(YGNodeStyleSetFlexWrap, ValidFlexWrapValues)},
            {"overflow", getYogaNodeEnumSetter(YGNodeStyleSetOverflow, ValidOverflowValues)},
            {"flex", getYogaNodeFloatSetter(YGNodeStyleSetFlex)},
            {"flex-grow", getYogaNodeFloatSetter(YGNodeStyleSetFlexGrow)},
            {"flex-shrink", getYogaNodeFloatSetter(YGNodeStyleSetFlexShrink)},
            {"flex-basis", getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetFlexBasis))},
            {"width", getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetWidth))},
            {"height", getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetHeight))},
            {"min-width", getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetMinWidth))},
            {"min-height", getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetMinHeight))},
            {"max-width", getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetMaxWidth))},
            {"max-height", getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetMaxHeight))},
            {"aspect-ratio", getYogaNodeFloatSetter(YGNodeStyleSetAspectRatio)},

            {"margin", getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetMargin), YGEdgeAll)},
            {juce::String("margin-") + YGEdgeToString(YGEdgeLeft), getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetMargin), YGEdgeLeft)},
            {juce::String("margin-") + YGEdgeToString(YGEdgeTop), getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetMargin), YGEdgeTop)},
            {juce::String("margin-") + YGEdgeToString(YGEdgeRight), getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetMargin), YGEdgeRight)},
            {juce::String("margin-") + YGEdgeToString(YGEdgeBottom), getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetMargin), YGEdgeBottom)},
            {juce::String("margin-") + YGEdgeToString(YGEdgeStart), getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetMargin), YGEdgeStart)},
            {juce::String("margin-") + YGEdgeToString(YGEdgeEnd), getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetMargin), YGEdgeEnd)},
            {juce::String("margin-") + YGEdgeToString(YGEdgeHorizontal), getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetMargin), YGEdgeHorizontal)},
            {juce::String("margin-") + YGEdgeToString(YGEdgeVertical), getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetMargin), YGEdgeLeft)},
            {juce::String("margin-") + YGEdgeToString(YGEdgeAll), getYogaNodeDimensionAutoSetter(BP_SPREAD_SETTER_AUTO(YGNodeStyleSetMargin), YGEdgeAll)},

            {"padding", getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeAll)},
            {juce::String("padding-") + YGEdgeToString(YGEdgeLeft), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeLeft)},
            {juce::String("padding-") + YGEdgeToString(YGEdgeTop), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeTop)},
            {juce::String("padding-") + YGEdgeToString(YGEdgeRight), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeRight)},
            {juce::String("padding-") + YGEdgeToString(YGEdgeBottom), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeBottom)},
            {juce::String("padding-") + YGEdgeToString(YGEdgeStart), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeStart)},
            {juce::String("padding-") + YGEdgeToString(YGEdgeEnd), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeEnd)},
            {juce::String("padding-") + YGEdgeToString(YGEdgeHorizontal), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeHorizontal)},
            {juce::String("padding-") + YGEdgeToString(YGEdgeVertical), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeVertical)},

            {"paddingLeft", getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeLeft)},
            {"paddingRight", getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeRight)},
            {"paddingTop", getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeTop)},
            {"paddingBottom", getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeBottom)},
            {"paddingHorizontal", getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeHorizontal)},
            {"paddingVertical", getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPadding), YGEdgeVertical)},

            {YGEdgeToString(YGEdgeLeft), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPosition), YGEdgeLeft)},
            {YGEdgeToString(YGEdgeTop), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPosition), YGEdgeTop)},
            {YGEdgeToString(YGEdgeRight), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPosition), YGEdgeRight)},
            {YGEdgeToString(YGEdgeBottom), getYogaNodeDimensionSetter(BP_SPREAD_SETTER_PERCENT(YGNodeStyleSetPosition), YGEdgeBottom)},
        };

    }

    //==============================================================================
    class ShadowView::ShadowViewPimpl
    {
    public:
        //==============================================================================
        ShadowViewPimpl(View* v)
            : view(v)
        {
            YGConfigSetUseWebDefaults(YGConfigGetDefault(), true);
            yogaNode = YGNodeNew();
        }

        ~ShadowViewPimpl()
        {
            YGNodeFree(yogaNode);
        }

        //==============================================================================
        bool setProperty (const juce::String& name, const juce::var& newValue)
        {
            props.set(name, newValue);

            if (name == "z-index" || name == "zIndex")
                return true;

            return propertySetters.call(name, newValue, yogaNode);
        }

        //==============================================================================
        void addChild (ShadowView* childView, int index = -1)
        {
            if (index == -1)
            {
                YGNodeInsertChild(yogaNode, childView->getShadowViewImpl().yogaNode, YGNodeGetChildCount(yogaNode));
                children.push_back(childView);
            }
            else
            {
                jassert (juce::isPositiveAndNotGreaterThan(index, YGNodeGetChildCount(yogaNode)));

                YGNodeInsertChild(yogaNode, childView->getShadowViewImpl().yogaNode, static_cast<uint32_t> (index));
                children.insert(children.begin() + index, childView);
            }
        }

        void removeChild (ShadowView* childView)
        {
            auto it = std::find(children.begin(), children.end(), childView);

            if (it != children.end())
            {
                YGNodeRemoveChild(yogaNode, childView->getShadowViewImpl().yogaNode);
                children.erase(it);
            }
        }

        //==============================================================================
        View* getAssociatedView() { return view; }

        //==============================================================================
        juce::Rectangle<float> getCachedLayoutBounds()
        {
            return {
                YGNodeLayoutGetLeft(yogaNode),
                YGNodeLayoutGetTop(yogaNode),
                YGNodeLayoutGetWidth(yogaNode),
                YGNodeLayoutGetHeight(yogaNode)
            };
        }

        void computeViewLayout(const float width, const float height)
        {
            // Compute the new layout values
            YGNodeCalculateLayout(yogaNode, width, height, YGDirectionInherit);
        }

        void flushViewLayout()
        {
#ifdef DEBUG
            if (props.contains(debugProp))
                YGNodePrint(yogaNode, (YGPrintOptions) (YGPrintOptionsLayout
                                                        | YGPrintOptionsStyle
                                                        | YGPrintOptionsChildren));
#endif

            if (props.contains(layoutAnimatedProp))
            {
                if (props[layoutAnimatedProp].isBool() && props[layoutAnimatedProp])
                {
                    // Default parameters
                    return flushViewLayoutAnimated(50.0, 45, BoundsAnimator::EasingType::Linear);
                }

                if (props[layoutAnimatedProp].isObject())
                {
                    double const durationMs = props[layoutAnimatedProp].getProperty(durationProp, 50.0);
                    double const frameRate = props[layoutAnimatedProp].getProperty(frameRateProp, 45);
                    int const et = props[layoutAnimatedProp].getProperty(easingProp, 0);

                    return flushViewLayoutAnimated(durationMs, static_cast<int> (frameRate), static_cast<BoundsAnimator::EasingType>(et));
                }
            }

            view->setFloatBounds(getCachedLayoutBounds());
            view->setBounds(getCachedLayoutBounds().toNearestInt());

            for (auto& child : children)
                child->flushViewLayout();

            layout_detail::expandViewBoundsForOutOfFlowChildren (view, children);
        }

        void flushViewLayoutAnimated(double const durationMs, int const frameRate, BoundsAnimator::EasingType const et)
        {
            auto viewCurrentBounds = view->getBounds().toFloat();
            auto viewDestinationBounds = getCachedLayoutBounds();

            animator = std::make_unique<BoundsAnimator>(
                durationMs,
                frameRate,
                et,
                viewCurrentBounds,
                viewDestinationBounds,
                [safeView = juce::Component::SafePointer(view)](auto && stepBounds)
                {
                    if (auto* v = safeView.getComponent()) {
                        v->setFloatBounds(stepBounds);
                        v->setBounds(stepBounds.toNearestInt());
                    }
                }
            );

            for (auto& child : children)
            {
                child->flushViewLayoutAnimated(durationMs, frameRate, et);
            }
        }

        //==============================================================================
        YGNodeRef yogaNode;
        View* view = nullptr;
        juce::NamedValueSet props;

        std::unique_ptr<BoundsAnimator> animator;
        std::vector<ShadowView*> children;

        //==============================================================================
    };

    namespace
    {
        /** Re-add direct View children in ascending z-index so later siblings paint/hit-test on top. */
        void sortDirectChildViewsByZIndex (View* parentView, const std::vector<ShadowView*>& children)
        {
            if (parentView == nullptr || children.empty())
                return;

            for (auto* sv : children)
            {
                if (sv == nullptr)
                    continue;

                if (auto* cv = sv->getAssociatedView())
                    if (cv->getParentComponent() != parentView)
                        return;
            }

            struct Row
            {
                ShadowView* sv = nullptr;
                size_t      index = 0;
                float       z = 0.f;
            };

            std::vector<Row> rows;
            rows.reserve (children.size());

            for (size_t i = 0; i < children.size(); ++i)
            {
                auto* sv = children[i];

                if (sv == nullptr)
                    continue;

                rows.push_back ({ sv, i, sv->getZIndex() });
            }

            std::stable_sort (rows.begin(), rows.end(), [] (const Row& a, const Row& b) {
                return a.z < b.z;
            });

            for (const auto& row : rows)
                if (auto* v = row.sv->getAssociatedView())
                    parentView->removeChildComponent (v);

            for (const auto& row : rows)
                if (auto* v = row.sv->getAssociatedView())
                    parentView->addAndMakeVisible (v);
        }
    } // namespace

    void ShadowView::applyZOrderToSubtree()
    {
        if (auto* pv = getAssociatedView())
        {
            auto& ch = getChildren();

            if (! ch.empty())
                sortDirectChildViewsByZIndex (pv, ch);
        }

        for (auto* c : getChildren())
            c->applyZOrderToSubtree();
    }

    //==============================================================================
}
