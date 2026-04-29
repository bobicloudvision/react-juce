/*
  ==============================================================================

    Utils.cpp
    Created: 20 Jan 2021 10:44:27pm

  ==============================================================================
*/

#include "Utils.h"

namespace reactjuce
{
    namespace detail
    {
        juce::var makeErrorObject(const juce::String& errorName, const juce::String& errorMessage)
        {
            juce::DynamicObject::Ptr o = new juce::DynamicObject();

            o->setProperty("name", errorName);
            o->setProperty("message", errorMessage);

            return o.get();
        }

        std::variant<juce::Colour, juce::ColourGradient> makeColorVariant(const juce::var& colorVariant, const juce::Rectangle<int>& localBounds)
        {
            //If object we assume it's a linear gradient
            if(colorVariant.isObject()) {
                auto linearGradientObj = juce::JSON::parse(juce::JSON::toString(colorVariant));
                int deg = linearGradientObj.getProperty("angle", juce::var());
                double radians = deg * (juce::MathConstants<double>::pi / 180.0);
                auto colorStops = linearGradientObj.getProperty("colours", juce::var()).getArray();
                double maximumPercent = colorStops->getFirst().getProperty("position", juce::var());
                double minimumPercent = colorStops->getFirst().getProperty("position", juce::var());
                juce::DynamicObject::Ptr colorStopsObj = new juce::DynamicObject();
                juce::Colour maxColor;
                juce::Colour minColor;
                for(auto& colorStop : *colorStops) {
                    double currentPosition = colorStop.getProperty("position", juce::var());
                    juce::String currentHex = colorStop.getProperty("hex", juce::var());
                    juce::DynamicObject::Ptr colorStopObj = new juce::DynamicObject();
                    colorStopObj->setProperty("hex", currentHex);
                    colorStopObj->setProperty("position", currentPosition);
                    colorStopObj->setProperty("type", "additional");
                    juce::String colorUUID = juce::Uuid().toString();
                    colorStopsObj->setProperty(colorUUID, colorStopObj.get());
                    if(currentPosition >= maximumPercent) {
                        maximumPercent = currentPosition;
                        for (auto& colors : colorStopsObj->getProperties())
                        {
                            juce::String colorID = colors.name.toString();
                            auto* color = colorStopsObj->getProperty(colorID).getDynamicObject();
                            if(color->getProperty("type") == "max"){
                                color->setProperty("type", "additional");
                            }
                        }
                        juce::String hexString = colorStopObj->getProperty("hex");
                        maxColor = juce::Colour::fromString(hexString);
                        colorStopObj->setProperty("type", "max");
                    }
                    if(currentPosition <= minimumPercent) {
                        minimumPercent = currentPosition;
                        for (auto& colors : colorStopsObj->getProperties())
                        {
                            juce::String colorID = colors.name.toString();
                            auto* color = colorStopsObj->getProperty(colorID).getDynamicObject();
                            if(color->getProperty("type") == "min"){
                                color->setProperty("type", "additional");
                            }
                        }
                        juce::String hexString = colorStopObj->getProperty("hex");
                        minColor = juce::Colour::fromString(hexString);
                        colorStopObj->setProperty("type", "min");
                    }
                }
                double positiveExtensionPercent = maximumPercent - 1.0;
                double negativeExtensionPercent = minimumPercent * -1;
                juce::Rectangle <int> const b {localBounds};
                int width = b.getWidth();
                int height = b.getHeight();
                juce::Array<double> centerPoint { width / 2.0, height / 2.0 };
                auto getEdgePointsFromAngle = [](int rectWidth, int rectHeight, int angleDeg) -> juce::Array<double> {
                    double twoPI = juce::MathConstants<double>::twoPi;
                    double theta = (360 - (angleDeg + 270))  * juce::MathConstants<double>::pi / 180;
                    while (theta < -juce::MathConstants<double>::pi) {
                        theta += twoPI;
                    }
                    while (theta > juce::MathConstants<double>::pi) {
                        theta -= twoPI;
                    }
                    double rectAtan = atan2(rectHeight, rectWidth);
                    double tanTheta = tan(theta);
                    int region;
                    if ((theta > -rectAtan) && (theta <= rectAtan)) {
                        region = 1;
                    } else if ((theta > rectAtan) && (theta <= (juce::MathConstants<double>::pi - rectAtan))) {
                        region = 2;
                    } else if ((theta > (juce::MathConstants<double>::pi - rectAtan)) || (theta <= -(juce::MathConstants<double>::pi - rectAtan))) {
                        region = 3;
                    } else {
                        region = 4;
                    }
                    double xEdge = rectWidth / 2;
                    double yEdge = rectHeight / 2;
                    int xFactor = 1;
                    int yFactor = 1;

                    switch(region) {
                        case 1: yFactor = -1; break;
                        case 2: yFactor = -1; break;
                        case 3: xFactor = -1; break;
                        case 4: xFactor = -1; break;
                    }

                    if ((region == 1) || (region == 3)) {
                        xEdge += xFactor * (rectWidth / 2.);
                        yEdge += yFactor * (rectWidth / 2.) * tanTheta;
                    }
                    else {
                        xEdge += xFactor * (rectHeight / (2. * tanTheta));
                        yEdge += yFactor * (rectHeight /  2.);
                    }
                    return juce::Array<double> { xEdge, yEdge };
                };
                //Calculate the gradient Line End point coordinates
                juce::Array<double> edgePoint1 = getEdgePointsFromAngle(width, height, deg + 180);
                juce::Array<double> edgePoint2 = getEdgePointsFromAngle(width, height, deg);
                const double ax1 = edgePoint1[0];
                const double ay1 = edgePoint1[1];
                const double ax2 = edgePoint2[0];
                const double ay2 = edgePoint2[1];
                double gradientLineDistance = abs(b.getWidth() * sin(radians) + abs(b.getHeight() * cos(radians)));
                double edgePoint1CenterDist = sqrt(pow((ax1 - centerPoint[0]), 2) + pow((ay1 - centerPoint[1]), 2));
                double edgePoint2CenterDist = sqrt(pow((ax2 - centerPoint[0]), 2) + pow((ay2 - centerPoint[1]), 2));
                double halfGradientDistance = gradientLineDistance/2;
                double distanceRatio1 = halfGradientDistance/edgePoint1CenterDist;
                double distanceRatio2 = halfGradientDistance/edgePoint2CenterDist;
                double gx1 = ((1 - distanceRatio1) * centerPoint[0]) + (distanceRatio1 * ax1);
                double gy1 = ((1 - distanceRatio1) * centerPoint[1]) + (distanceRatio1 * ay1);
                double gx2 = ((1 - distanceRatio2) * centerPoint[0]) + (distanceRatio2 * ax2);
                double gy2 = ((1 - distanceRatio2) * centerPoint[1]) + (distanceRatio2 * ay2);
                //Gradient line Points
                const double glX1 = gx1; const double glX2 = gx2; const double glY1 = gy1; const double glY2 = gy2;
                //Offset the gradient line length with min max extension percent
                gx1 = ((1 - (negativeExtensionPercent * -1)) * glX1) + ((negativeExtensionPercent * -1) * glX2);
                gy1 = ((1 - (negativeExtensionPercent * -1)) * glY1) + ((negativeExtensionPercent * -1) * glY2);
                gx2 = ((1 - (positiveExtensionPercent * -1)) * glX2) + ((positiveExtensionPercent * -1) * glX1);
                gy2 = ((1 - (positiveExtensionPercent * -1)) * glY2) + ((positiveExtensionPercent * -1) * glY1);
                juce::ColourGradient gradient = juce::ColourGradient (
                    minColor, (float) gx1, (float) gy1, maxColor, (float) gx2, (float) gy2, false);
                for (auto& colors : colorStopsObj->getProperties())
                {
                    juce::String colorID = colors.name.toString();
                    auto* color = colorStopsObj->getProperty(colorID).getDynamicObject();
                    //Calculate any offset from the original additional color percentage along gradient line
                    if(color->getProperty("type") == "additional"){
                        juce::String hexString = color->getProperty("hex");
                        juce::Colour additionalColor = juce::Colour::fromString(hexString);
                        double originalPercent = color->getProperty("position");
                        double gradientLineDistanceExtension = gradientLineDistance * (1 + (negativeExtensionPercent + positiveExtensionPercent));
                        double offsetPercent = ((gradientLineDistance * originalPercent) + (gradientLineDistance * negativeExtensionPercent)) / gradientLineDistanceExtension;
                        gradient.addColour(offsetPercent, additionalColor);
                    }
                }
                return gradient;
            }
            //else we assume it's just one colour
            else {
                return juce::Colour::fromString(colorVariant.toString());;
            }
        }
    }
}
