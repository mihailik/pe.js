module pe {

  /**
   * Used for optional cooperative multitasking.
   */
  export interface AsyncCallback<T> {

    (error: Error, result: T);

    progress?: AsyncCallback.ProgressCallback;

  }


  export module AsyncCallback {

    export interface ProgressCallback {
      (value: number, total: number, text?: string): YieldCallback;
    }

    export interface YieldCallback {
      (next: () => void);
    }

  }

}