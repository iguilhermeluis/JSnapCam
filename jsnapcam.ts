export type facingModeType = "user" | "enviroment";
export type statusType = "on" | "off";
export type inputInfoType = {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
};

/**
 * Class that manages webcam interaction.
 */
export default class Webcam {
  _webcamElement: HTMLVideoElement;
  _facingMode: facingModeType;
  _webcamList: MediaDeviceInfo[];
  _streamList: MediaStream[];
  _selectedDeviceId: string;
  _canvasElement: HTMLCanvasElement | null;
  _snapSoundElement: HTMLAudioElement | null;
  _status: statusType;
  _ratio: number; // 1,777777777777778
  _activateAutofocusIfItExists: boolean;
  _rememberLastCameraChoice: boolean;

  /**
   * Creates a new instance of the Webcam class.
   * @param webcamElement The HTML video element that will display the webcam stream.
   * @param facingMode The camera's facing mode (user or environment).
   * @param canvasElement (optional) The HTML canvas element for capturing images.
   * @param snapSoundElement (optional) The HTML audio element to play a sound when taking a photo.
   * @param ratio (optional) The aspect ratio for capturing images (default is 16:9).
   * @param activateAutofocusIfItExists (optional) Enables continuous autofocus if supported (default is true).
   * @param rememberLastCameraChoice (optional) Enable saving to localstorage last camera choice (default is true).
   */
  constructor(
    webcamElement: HTMLVideoElement,
    facingMode: facingModeType = "user",
    canvasElement: HTMLCanvasElement | null = null,
    snapSoundElement: HTMLAudioElement | null = null,
    ratio = 16 / 9,
    activateAutofocusIfItExists = true,
    rememberLastCameraChoice = true
  ) {
    this._webcamElement = webcamElement;
    this._facingMode = facingMode;
    this._webcamList = [];
    this._streamList = [];
    this._selectedDeviceId = "";
    this._canvasElement = canvasElement;
    this._snapSoundElement = snapSoundElement;
    this._status = "off";
    this._ratio = ratio;
    this._activateAutofocusIfItExists = activateAutofocusIfItExists;
    this._rememberLastCameraChoice = rememberLastCameraChoice;
  }

  /**
   * Gets the current facing mode of the camera.
   */
  get facingMode() {
    return this._facingMode;
  }

  /**
   * Sets the facing mode of the camera (user or environment).
   * @param value The new facing mode value.
   */
  set facingMode(value) {
    this._facingMode = value;
  }

  /**
   * Gets the list of available video input devices.
   */
  get webcamList() {
    return this._webcamList;
  }

  /**
   * Gets the number of available video input devices.
   */
  get webcamCount() {
    return this._webcamList.length;
  }

  /**
   * Sets the ID of the selected video input device.
   * @param value The new value of the device ID.
   */
  get selectedDeviceId() {
    return this._selectedDeviceId;
  }

  /**
   * Gets the list of camera streams.
   */
  set selectedDeviceId(value) {
    this._selectedDeviceId = value;
    this.saveSelectedDeviceIdToDeviceStorage();
  }

  /**
   * Gets the list of camera streams.
   */
  get streamList() {
    return this._streamList;
  }

  /**
   * Saves the selected device ID to the browser's local storage.
   *
   * The `saveSelectedDeviceIdToDeviceStorage()` method checks if a device ID is selected and then saves it to the browser's local storage.
   * If there is no selected device ID (i.e., the `_selectedDeviceId` property is empty), the method returns immediately without performing any action.
   *
   * The selected device ID is stored using the key "selectedDeviceId" in the local storage, and it persists even when the user closes the browser or navigates away from the page.
   *
   * @remarks
   * This method is typically used internally in the `Webcam` class to save the selected camera device ID, so it can be retrieved and used in subsequent interactions with the camera.
   * @public
   * @returns {void}
   */
  saveSelectedDeviceIdToDeviceStorage(): void {
    if (!this._selectedDeviceId || !this._rememberLastCameraChoice) return;
    localStorage.setItem("selectedDeviceId", this._selectedDeviceId);
  }

  /**
   * Retrieves the selected device ID from the browser's local storage.
   *
   * The `getSelectedDeviceIdFromDeviceStorage()` method retrieves the selected device ID from the browser's local storage.
   * If no device ID has been previously saved (i.e., no value is associated with the key "selectedDeviceId" in the local storage), the method returns `null`.
   *
   * The method is useful for retrieving the last selected camera device ID when initializing the `Webcam` class or when the user returns to the page, so the camera can be automatically set to the last used device.
   *
   * @remarks
   * This method is typically used internally in the `Webcam` class to save the selected camera device ID, so it can be retrieved and used in subsequent interactions with the camera.
   * @public
   * @returns {string | null} A string representing the selected device ID, or `null` if no device ID has been previously saved in local storage.
   */
  getSelectedDeviceIdFromDeviceStorage(): string | null {
    return localStorage.getItem("selectedDeviceId");
  }

  /**
   * Gets information about available video input devices.
   * @returns A Promise that resolves to a list of objects with information about the video input devices.
   */
  async getInfoVideoInputs(): Promise<MediaDeviceInfo[]> {
    let options = await navigator.mediaDevices.enumerateDevices();
    options = options.filter((option) => option.kind == "videoinput");
    return options;
  }

  /**
   * Gets the list of video input devices from the provided media devices.
   * The `getVideoInputs()` method filters the provided list of media devices and populates the webcam list with video input devices.
   * If there is only one video input device, it sets the facing mode to "user".
   * @param {MediaDeviceInfo[]} mediaDevices - The list of media devices to filter.
   * @returns {MediaDeviceInfo[]} - The list of video input devices.
   */
  getVideoInputs(mediaDevices: MediaDeviceInfo[]) {
    this._webcamList = [];
    mediaDevices.forEach((mediaDevice) => {
      if (mediaDevice.kind === "videoinput") {
        this._webcamList.push(mediaDevice);
      }
    });
    if (this._webcamList.length === 1) {
      this._facingMode = "user";
    }
    return this._webcamList;
  }

  /**
   * Gets the media constraints for the webcam stream.
   * The `getMediaConstraints()` method constructs the media constraints based on the selected webcam and facing mode.
   * If a specific device ID is selected, it sets the `deviceId` constraint to that ID, otherwise, it uses the `facingMode` constraint.
   * The method also includes the aspect ratio constraint and disables audio in the stream.
   * @returns {MediaStreamConstraints} - The media constraints for the webcam stream.
   */
  getMediaConstraints(): MediaStreamConstraints {
    const videoConstraints: MediaTrackConstraints = {};
    if (this._selectedDeviceId === "") {
      videoConstraints.facingMode = this._facingMode;
    } else {
      videoConstraints.deviceId = { exact: this._selectedDeviceId };
    }
    videoConstraints.aspectRatio = this._ratio;
    const constraints: MediaStreamConstraints = {
      video: videoConstraints,
      audio: false,
    };
    return constraints;
  }

  /**
   * Selects the camera based on the current facing mode.
   * The `selectCamera()` method searches through the available webcam list to find a camera that matches the current facing mode.
   * If the facing mode is "user", it looks for a camera with the label containing "front".
   * If the facing mode is "environment", it looks for a camera with the label containing "back".
   * Once a matching camera is found, it sets the selected device ID to that camera's ID.
   * If no matching camera is found, it does not change the selected device ID.
   * @returns {void}
   */
  selectCamera() {
    const lastSelectedDeviceId = this.getSelectedDeviceIdFromDeviceStorage();
    if (lastSelectedDeviceId) {
      this._selectedDeviceId = lastSelectedDeviceId;
    } else {
      for (const webcam of this._webcamList) {
        if (
          (this._facingMode === "user" &&
            webcam.label.toLowerCase().includes("front")) ||
          (this._facingMode === "enviroment" &&
            webcam.label.toLowerCase().includes("back"))
        ) {
          this._selectedDeviceId = webcam.deviceId;
          break;
        }
      }
    }
  }

  /**
   * Flips the camera's facing mode.
   * The `flip()` method toggles the camera's facing mode between "user" and "environment".
   * If the current facing mode is "user", it changes it to "environment", and vice versa.
   * After flipping the facing mode, it resets the CSS transform of the webcam element and calls the `selectCamera()` method to update the selected camera based on the new facing mode.
   * @returns {void}
   * @public
   */
  public flip() {
    this._facingMode = this._facingMode === "user" ? "enviroment" : "user";
    this._webcamElement.style.transform = "";
    this.selectCamera();
  }

  /**
   * Starts the webcam and begins streaming if specified.
   * The `start()` method stops any existing webcam streaming using `stop()`, then requests user permission to access the webcam using `navigator.mediaDevices.getUserMedia()`.
   * It applies the media constraints obtained from `getMediaConstraints()` and optionally enables autofocus for the webcam stream if supported by the device.
   * If `startStream` is `true`, it starts streaming the webcam using the `stream()` method, sets the status to "on", and resolves with the current facing mode.
   * If `startStream` is `false`, it resolves with the selected device ID without starting the streaming.
   * @param {boolean} [startStream=true] - Specifies whether to start streaming the webcam immediately after starting. Default is `true`.
   * @returns {Promise<string>} - A Promise that resolves with the current facing mode if the webcam is started successfully, or with the selected device ID if `startStream` is `false`.
   * @public
   */
  public async start(startStream = true): Promise<string> {
    return new Promise((resolve, reject) => {
      this.stop();

      const mediaConstraints = this.getMediaConstraints();

      if (this._activateAutofocusIfItExists) {
        if ("advanced" in mediaConstraints) {
          const supportedConstraints =
            navigator.mediaDevices.getSupportedConstraints();
          if ("focusMode" in supportedConstraints) {
            mediaConstraints.advanced = [{ focusMode: "continuous" }];
          }
        }
      }

      navigator.mediaDevices
        .getUserMedia(mediaConstraints) // get permission from the user
        .then((stream) => {
          this._streamList.push(stream);
          this.info() // get all video input devices info
            .then(() => {
              this.selectCamera(); // select camera based on facingMode
              if (startStream) {
                this.stream()
                  .then(() => {
                    this._status = "on";
                    setTimeout(() => {
                      this.setPosition();
                    }, 100);
                    this.saveSelectedDeviceIdToDeviceStorage(); // Save the selected device ID to local storage
                    resolve(this._facingMode);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              } else {
                resolve(this._selectedDeviceId);
              }
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Gets information about available video input devices.
   * The `info()` method asynchronously retrieves a list of media devices using the `navigator.mediaDevices.enumerateDevices()` API.
   * It then filters the devices to obtain only the video input devices using the `getVideoInputs()` method and returns the resulting list of video input devices.
   * @returns {Promise<MediaDeviceInfo[]>} - A Promise that resolves to a list of objects containing information about the available video input devices.
   * @private
   */
  private async info(): Promise<MediaDeviceInfo[]> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          resolve(this.getVideoInputs(devices));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Starts streaming the webcam to the video element.
   * The `stream()` method starts the webcam stream using `navigator.mediaDevices.getUserMedia()` with the media constraints obtained from `getMediaConstraints()`.
   * It adds the stream to the stream list, sets the `srcObject` of the webcam element to the stream, and plays the video.
   * If the facing mode is "user", it flips the video horizontally using CSS.
   * The method resolves with the current facing mode when the streaming starts successfully.
   * @returns {Promise<string>} - A Promise that resolves to the current facing mode when the webcam streaming starts successfully.
   * @public
   */
  public async stream(): Promise<string> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia(this.getMediaConstraints())
        .then((stream) => {
          this._streamList.push(stream);
          this._webcamElement.srcObject = stream;
          if (this._facingMode === "user") {
            this._webcamElement.style.transform = "scale(-1,1)";
          }
          this._webcamElement.play();
          this._status = "on";
          resolve(this._facingMode);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  /**
   * Stops the webcam streaming and releases the media tracks.
   * The `stop()` method stops the webcam streaming and releases the media tracks associated with it.
   * It sets the status of the webcam to "off".
   * @returns {void}
   * @public
   */
  public stop(): void {
    this._streamList.forEach((stream) => {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    });
    this._status = "off";
  }

  /**
   * Takes a photo from the webcam and returns the image as a base64 string.
   * @returns The captured image in base64 format.
   * @throws An error if the canvas element is missing.
   */
  public snap(): string {
    if (this._canvasElement !== null) {
      if (this._snapSoundElement !== null) {
        this._snapSoundElement.play();
      }

      const webcamAspectRatio =
        this._webcamElement.videoWidth / this._webcamElement.videoHeight;
      this._canvasElement.width = this._webcamElement.clientWidth;
      this._canvasElement.height =
        this._webcamElement.clientWidth / webcamAspectRatio;

      const context = this._canvasElement.getContext("2d");
      if (this._facingMode === "user") {
        context?.translate(this._canvasElement.width, 0);
        context?.scale(-1, 1);
      }
      context?.clearRect(
        0,
        0,
        this._canvasElement.width,
        this._canvasElement.height
      );

      const scaleFactor =
        this._canvasElement.width / this._webcamElement.videoWidth;
      const scaledHeight = this._webcamElement.videoHeight * scaleFactor;
      const offsetY = (this._canvasElement.height - scaledHeight) / 2;

      context?.drawImage(
        this._webcamElement,
        0,
        0,
        this._webcamElement.videoWidth,
        this._webcamElement.videoHeight,
        0,
        offsetY,
        this._canvasElement.width,
        scaledHeight
      );

      const data = this._canvasElement.toDataURL("image/png");
      return data;
    } else {
      throw new Error("canvas element is missing");
    }
  }

  /**
   * Sets the position and size of the webcam element to adjust its appearance.
   * @private
   */
  private setPosition(): void {
    try {
      this._webcamElement.width = this._webcamElement.width || 640;
      this._webcamElement.height = this._webcamElement.width / this._ratio;
      this._webcamElement.style.left =
        -(this._webcamElement.clientWidth / 2 - window.innerWidth / 2) + "px";
    } catch (error) {
      console.log(error);
    }
  }
}
