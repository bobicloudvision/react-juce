cmake_minimum_required(VERSION 3.15)
project(PlaygroundPlugin VERSION 0.1.0)

juce_add_plugin(PlaygroundPlugin
    PLUGIN_MANUFACTURER_CODE Reju
    PLUGIN_CODE Plyg
    FORMATS AU VST3 Standalone
    PRODUCT_NAME "ReactJUCE Playground")

juce_generate_juce_header(PlaygroundPlugin)

target_sources(PlaygroundPlugin PRIVATE PluginProcessor.cpp)

target_include_directories(PlaygroundPlugin PRIVATE "${CMAKE_SOURCE_DIR}/react_juce")

target_compile_definitions(PlaygroundPlugin
    PRIVATE
    PLAYGROUNDPLUGIN_SOURCE_DIR="${CMAKE_CURRENT_SOURCE_DIR}"
    JUCE_WEB_BROWSER=0
    JUCE_USE_CURL=0
    JUCE_VST3_CAN_REPLACE_VST2=0)

target_link_libraries(PlaygroundPlugin PRIVATE
    juce::juce_recommended_config_flags
    juce::juce_recommended_lto_flags
    juce::juce_recommended_warning_flags
    juce::juce_core
    juce::juce_audio_basics
    juce::juce_audio_devices
    juce::juce_audio_processors
    juce::juce_audio_utils
    juce::juce_graphics
    juce::juce_gui_basics
    react_juce)
