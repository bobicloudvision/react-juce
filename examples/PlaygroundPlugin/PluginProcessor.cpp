#include "PluginProcessor.h"

namespace
{
AudioProcessorValueTreeState::ParameterLayout createParameterLayout()
{
    return {
        std::make_unique<AudioParameterFloat>(
            "DemoGain",
            "Gain",
            NormalisableRange<float>(0.0f, 1.0f),
            0.75f),
        std::make_unique<AudioParameterFloat>(
            "DemoDepth",
            "Depth",
            NormalisableRange<float>(0.0f, 1.0f),
            0.5f),
        std::make_unique<AudioParameterBool>("DemoBypass", "Bypass", false),
    };
}
} // namespace

PlaygroundPluginAudioProcessor::PlaygroundPluginAudioProcessor()
    : AudioProcessor(BusesProperties()
                         .withInput("Input", AudioChannelSet::stereo(), true)
                         .withOutput("Output", AudioChannelSet::stereo(), true)),
      params(*this, nullptr, JucePlugin_Name, createParameterLayout())
{
}

PlaygroundPluginAudioProcessor::~PlaygroundPluginAudioProcessor()
{
    stopTimer();
}

const String PlaygroundPluginAudioProcessor::getName() const
{
    return JucePlugin_Name;
}

bool PlaygroundPluginAudioProcessor::acceptsMidi() const
{
#if JucePlugin_WantsMidiInput
    return true;
#else
    return false;
#endif
}

bool PlaygroundPluginAudioProcessor::producesMidi() const
{
#if JucePlugin_ProducesMidiOutput
    return true;
#else
    return false;
#endif
}

bool PlaygroundPluginAudioProcessor::isMidiEffect() const
{
#if JucePlugin_IsMidiEffect
    return true;
#else
    return false;
#endif
}

double PlaygroundPluginAudioProcessor::getTailLengthSeconds() const
{
    return 0.0;
}

int PlaygroundPluginAudioProcessor::getNumPrograms()
{
    return 1;
}

int PlaygroundPluginAudioProcessor::getCurrentProgram()
{
    return 0;
}

void PlaygroundPluginAudioProcessor::setCurrentProgram(int) {}

const String PlaygroundPluginAudioProcessor::getProgramName(int)
{
    return {};
}

void PlaygroundPluginAudioProcessor::changeProgramName(int, const String&) {}

void PlaygroundPluginAudioProcessor::prepareToPlay(double, int) {}

void PlaygroundPluginAudioProcessor::releaseResources() {}

#ifndef JucePlugin_PreferredChannelConfigurations
bool PlaygroundPluginAudioProcessor::isBusesLayoutSupported(
    const BusesLayout& layouts) const
{
#if JucePlugin_IsMidiEffect
    ignoreUnused(layouts);
    return true;
#else
    if (layouts.getMainOutputChannelSet() != AudioChannelSet::mono()
        && layouts.getMainOutputChannelSet() != AudioChannelSet::stereo())
        return false;

#if !JucePlugin_IsSynth
    if (layouts.getMainOutputChannelSet() != layouts.getMainInputChannelSet())
        return false;
#endif

    return true;
#endif
}
#endif

void PlaygroundPluginAudioProcessor::processBlock(AudioBuffer<float>& buffer,
                                                  MidiBuffer& midiMessages)
{
    ScopedNoDenormals noDenormals;
    ignoreUnused(midiMessages);

    for (int i = getTotalNumInputChannels(); i < getTotalNumOutputChannels(); ++i)
        buffer.clear(i, 0, buffer.getNumSamples());

    if (auto* bypass = dynamic_cast<AudioParameterBool*>(params.getParameter("DemoBypass")))
    {
        if (bypass->get())
            return;
    }

    const float gain = *params.getRawParameterValue("DemoGain");
    const float depth = *params.getRawParameterValue("DemoDepth");
    buffer.applyGain(gain * depth);
}

bool PlaygroundPluginAudioProcessor::hasEditor() const
{
    return true;
}

AudioProcessorEditor* PlaygroundPluginAudioProcessor::createEditor()
{
    File sourceDir(PLAYGROUNDPLUGIN_SOURCE_DIR);
    File bundle = sourceDir.getChildFile("jsui/build/js/main.js");

    auto* editor = new reactjuce::GenericEditor(*this, bundle);
    editor->setResizable(true, true);
    editor->setResizeLimits(560, 520, 2560, 1800);
    editor->setSize(1100, 800);
    startTimerHz(30);
    return editor;
}

void PlaygroundPluginAudioProcessor::timerCallback()
{
    if (auto* editor = dynamic_cast<reactjuce::GenericEditor*>(getActiveEditor()))
    {
        tickPhase += 0.08f;
        if (tickPhase > MathConstants<float>::twoPi)
            tickPhase -= MathConstants<float>::twoPi;

        editor->getReactAppRoot().dispatchEvent("playgroundTick", tickPhase);
    }
}

void PlaygroundPluginAudioProcessor::getStateInformation(MemoryBlock&) {}

void PlaygroundPluginAudioProcessor::setStateInformation(const void*, int) {}

AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new PlaygroundPluginAudioProcessor();
}
