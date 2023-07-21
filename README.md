# JSnapCam

The `JSnapCam` is a JavaScript class that facilitates webcam interaction and streaming. It provides methods to access and manage video input devices, start and stop webcam streaming, take photos, and more.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Constructor](#constructor)
  - [Properties](#properties)
  - [Methods](#methods)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The `JSnapCam` simplifies webcam interactions in web applications. It allows you to:

- Access and list available video input devices.
- Start and stop webcam streaming.
- Flip between front-facing and rear-facing cameras (if available).
- Take photos and capture webcam frames as base64-encoded images.
- Store and retrieve the last selected camera choice using local storage.

## Installation

#### Use Git Clone

```shell
git https://github.com/iguilhermeluis/JSnapCam.git
```

#### OR Use NPM

[![NPM](https://nodei.co/npm/jsnapcam.png?compact=true)](https://nodei.co/npm/jsnapcam/)

```shell
npm install jsnapcam
# or
yarn add jsnapcam
```

To use the `JSnapCam` in your project, you can either include the source code directly in your JavaScript bundle or import the class from a module.

### Usage

#### 1. Include script tag in html <head>

```html
<script
  type="text/javascript"
  src="https://unpkg.com/jsnapcam/dist/jsnapcam.min.js"
></script>
```

    or Import into javascript

```js
import Webcam from "jsnapcam";
```

### API Reference

#### Constructor

```javascript
constructor(
  webcamElement,
  facingMode,
  canvasElement,
  snapSoundElement,
  ratio,
  activateAutofocusIfItExists,
  rememberLastCameraChoice
);
```

Creates a new instance of the JSnapCam.

- `webcamElement`: The HTML video element that will display the webcam stream.
- `facingMode (optional): The camera's facing mode (either "user" or "environment"). Default is "user".
- `canvasElement (optional)`: The HTML canvas element for capturing images. Default is null.
- `snapSoundElement (optional)`: The HTML audio element to play a sound when taking a photo. Default is null.
- `ratio (optional)`: The aspect ratio for capturing images. Default is 16:9.
- `activateAutofocusIfItExists (optional)`: Enables continuous autofocus if supported. Default is true.
- `rememberLastCameraChoice (optional)`: Enable saving the last camera choice to local storage. Default is true.

### Properties

- `facingMode` - Gets or sets the current facing mode of the camera (either "user" or "environment").

- `webcamList` - Gets the list of available video input devices (MediaDeviceInfo[]).

- `webcamCount` - Gets the number of available video input devices.

- `selectedDeviceId` - Gets or sets the ID of the selected video input device.

- `streamList`- Gets the list of camera streams (MediaStream[]).

### Methods

- `start(startStream)` - Starts the webcam and begins streaming if specified.
- `stream()` - Starts streaming the webcam to the video element.
- `stop()` - Stops the webcam streaming and releases the media tracks.
- `snap()` - Takes a photo from the webcam and returns the image as a base64 string.
- `flip()` - Flips the camera's facing mode between "user" and "environment".
- `getInfoVideoInputs()` - Gets information about available video input devices.

### Contributing ✨

Contributions to the JSnapCam are welcome! If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<table>
  <tr>
   <td align="center">
        <a href="https://github.com/iguilhermeluis">
        <img src="https://avatars.githubusercontent.com/u/26286830?v=3?s=100" width="100px;" alt=""/><br />
        <sub><b>Guilherme L. Faustino</b></sub></a><br />
        <a href="https://github.com/iguilhermeluis/jsnapcam/commits?author=iguilhermeluis" title="Code">💻</a>
        <a href="https://github.com/iguilhermeluis/jsnapcam/commits?author=iguilhermeluis" title="Documentation">📖</a>  
        <a href="https://github.com/iguilhermeluis/jsnapcam/commits?author=iguilhermeluis" title="Tests">⚠️</a>  
   </td> 
  </tr>
</table>

### License

The JSnapCam is licensed under the MIT License. Feel free to use it in your projects, both personal and commercial.
