module pe.headers {

  export enum Subsystem {
    /**
     * Unknown subsystem.
     */
    Unknown = 0,

    /**
     * No subsystem required (device drivers and native system processes).
     */
    Native = 1,

    /**
     * Windows graphical user interface (GUI) subsystem.
     */
    WindowsGUI = 2,

    /**
     * Windows character-mode user interface (CUI) subsystem.
     */
    WindowsCUI = 3,

    /**
     * OS/2 console subsystem.
     */
    OS2CUI = 5,

    /**
     * POSIX console subsystem.
     */
    POSIXCUI = 7,

    /**
     * Image is a native Win9x driver.
     */
    NativeWindows = 8,

    /**
     * Windows CE system.
     */
    WindowsCEGUI = 9,

    /**
     * Extensible Firmware Interface (EFI) application.
     */
    EFIApplication = 10,

    /**
     * EFI driver with boot services.
     */
    EFIBootServiceDriver = 11,

    /**
     * EFI driver with run-time services.
     */
    EFIRuntimeDriver = 12,

    /**
     * EFI ROM image.
     */
    EFIROM = 13,

    /**
     * Xbox system.
     */
    XBOX = 14,

    /**
     * Boot application.
     */
    BootApplication = 16
  }

}