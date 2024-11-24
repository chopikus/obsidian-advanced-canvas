This fork adds a screen sharing feature from a reMarkable tablet. It is a proof of concept, the plugin doesn't work yet with https and authentication.

## Installation
1. Set up [goMarkableStream](https://github.com/owulveryck/goMarkableStream) on your reMarkable tablet. Make sure you run goMarkableStream with environment variable `RK_HTTPS=false` and with `-unsafe` argument. Example: `RK_HTTPS=false ./goMarkableStream -unsafe`.
2. Add this plugin via [BRAT](https://github.com/TfTHacker/obsidian42-brat) or directly.
3. Enable ReMarkable Screen Sharing option in Advanced Canvas settings.

## Usage
So far there are 3 ways to insert a ReMarkable screen available:
* _Insert ReMarkable screen (Portrait)_ command.
* _Insert ReMarkable screen (Landscape)_ command.
* _Insert rM screen (Landscape) button in the card layout.
