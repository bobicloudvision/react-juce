# Fonts

## System fonts

`<Text>`, `<TextInput>`, and Canvas `ctx.font` accept **`font-family`** / **`fontFamily`** with names from the operating system (same as JUCE `Font`).

## Embedded (bundled) fonts

JUCE does not load arbitrary font bytes into the global OS font list. React-JUCE registers embedded fonts in **`reactjuce::FontRegistry`**:

1. Add your `.ttf` / `.otf` file with **`juce_add_binary_data`** in your plugin CMake target.
2. Before opening the React bundle (e.g. in **`createEditor()`**), call:

```cpp
#include <BinaryData.h>
#include "core/FontRegistry.h"

reactjuce::FontRegistry::getInstance().registerFontMemory(
    BinaryData::YourFont_ttf,
    (size_t) BinaryData::YourFont_ttfSize);
```

3. Use the **family name stored in the font file** in JSX styles, e.g. `'font-family': 'Inter'`.

`FontRegistry` trims **`font-family`** values (quotes, takes the first entry in a stack like `Inter, sans-serif`). Prefer **static** `.ttf` files for predictable defaults; variable fonts may register under an unexpected default instance on some platforms.

You can map a shorter CSS name with **`registerAlias("Display", "Actual Family From File")`**.

The Playground plugin embeds **`fonts/Inter-Regular.ttf`** and **`fonts/Outfit-Regular.ttf`** and registers both in **`PluginProcessor.cpp`**.
