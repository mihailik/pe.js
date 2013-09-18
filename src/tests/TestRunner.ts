module TestRunner {

	function collectTests(moduleName, moduleObj? ): TestCase[] {
		if (!moduleObj) {
			moduleObj = moduleName;
			moduleName = "";
		}

		var testList: TestCase[] = [];

		function collectTestsCore(namePrefix: string, moduleObj, test_prefixOnly: bool) {
			for (var testName in moduleObj) {
				if (moduleObj.hasOwnProperty && !moduleObj.hasOwnProperty(testName))
					continue;

				if (test_prefixOnly) {
					if (testName.substring(0, "test_".length) !== "test_")
						continue;
				}

				var test = moduleObj[testName];

				if (typeof (test) === "function") {
					var testName = test.name;
					if (!testName) {
						testName = test.toString();
						testName = testName.substring(0, testName.indexOf("("));
						testName = testName.replace(/function /g, "");
					}

					testList.push(new TestCase(namePrefix + testName, test));
					continue;
				}

				if (typeof (test) === "object") {
					collectTestsCore(namePrefix + testName + ".", test, false);
				}
			}
		}

		collectTestsCore(moduleName ? moduleName + "." : "", moduleObj, true);

		return testList;
	}

	function runTest(test: TestCase, onfinish: () => void ) {
		var logPrint = (s) => {
			test.logText += (test.logText.length > 0 ? "\n" : "") + s;
		};

		var startTime = new Date().getTime();
		var updateTime = () => {
			var endTime = new Date().getTime();

			test.executionTimeMsec = endTime - startTime;
		};

		try {
			var ts: TestRuntime = <any>{
				ok: (message: string) => {
					if (test.success === false)
						return;

					if (message)
						logPrint(message);
					test.success = true;
					updateTime();
					onfinish();
				},
				fail: (message: string) => {
					if (message)
						logPrint(message);
					test.success = false;
					updateTime();
					onfinish();
				},
				log: (message) => {
					if (message)
						logPrint(message);
				}
			};

			test.testMethod(ts);
		}
		catch (syncError) {
			logPrint(
				syncError === null ? "null" :
				typeof (syncError) === "object" ?
					(syncError.stack ? syncError.stack :
					syncError.message ? syncError.message :
					syncError + "") :
				syncError === null ? "null" :
				(syncError + ""));
			test.success = false;
			updateTime();
			onfinish();
			return;
		}

		// detect synchronous tests: they don't take arguments
		var openBracketPos = test.testMethod.toString().indexOf("(");
		if (openBracketPos > 0 && test.testMethod.toString().substring(openBracketPos + 1, openBracketPos + 2) === ")") {
			if (test.success === false)
				return;

			test.success = true;
			updateTime();
			onfinish();
		}
	}


	export interface TestRuntime {
		ok(message?: string): void;
		fail(message?: string): void;
		log(message: string): void;
	}

	export class TestCase {
		success: bool = <any>null;
		logText: string = "";
		executionTimeMsec: number = <any>null;

		constructor (public name: string, public testMethod: (ts: TestRuntime) => void ) {
		}

		toString() {
			return this.name +
				" " + this.executionTimeMsec + "ms" +
				(this.success ? " OK" : " FAIL") +
				(this.logText ? " " : "") +
				(this.logText && this.logText.indexOf("\n") >= 0 ? "\n	" + this.logText.replace(/\n/g, "\n	") : this.logText);
		}
	}

	declare var htmlConsole;

	export function runTests(moduleName, moduleObj? , onfinished?: (tests: TestCase[]) => void ) {
		if (typeof (moduleName) !== "string") {
			onfinished = moduleObj;
			moduleObj = moduleName;
			moduleName = "";
		}

		var tests = collectTests(moduleName, moduleObj);

		var global = (function () { return this; })();
		
		var sysLog;
		if ("WScript" in global) {
			sysLog = (msg) => WScript.Echo(msg);
		}
		else if ("htmlConsole" in global) {
			sysLog = (msg) => htmlConsole.log(msg);
		}
		else {
			sysLog = (msg) => console.log(msg);
		}

		sysLog("Running " + tests.length + " tests.managed..");

		function defaultOnFinished(tests: TestCase[]) {

			var failedTests: TestCase[] = [];
			var totalRunningTime = 0;
			for (var i = 0; i < tests.length; i++) {
				if (tests[i].success === false)
					failedTests.push(tests[i]);
				totalRunningTime += tests[i].executionTimeMsec;
			}

			if (failedTests.length > 0) {
				sysLog(failedTests.length + " tests failed out of " + tests.length + " in " + (totalRunningTime/1000) + " sec:");

				for (var i = 0; i < failedTests.length; i++) {
					sysLog("  " + failedTests[i].name);
				}
			}
			else {
				sysLog("All " + tests.length + " tests succeeded in " + (totalRunningTime/1000) + " sec.");
			}
		}

		var iTest = 0;

		var nextQueued = false;
		function continueNext() {
			nextQueued = true;
		};

		function next() {
			if (iTest >= tests.length) {
				if (onfinished)
					onfinished(tests);
				else
					defaultOnFinished(tests);
				return;
			}

			runTest(tests[iTest], () => {
				sysLog(iTest + ". " + tests[iTest]);
				if (!tests[iTest].success) {
					sysLog("###------###-----###-----###---");
					sysLog("");
				}

				iTest++;
				continueNext();
			});
		}

		function processMany() {
			var lastAsyncQueue = new Date().getTime();
			var firstTest = false;
			while (nextQueued) {
				if (firstTest) {
					firstTest = false;
				}
				else {
					if ("setTimeout" in global) {
						var now = new Date().getTime();
						if (now - lastAsyncQueue > 10000) {
							setTimeout(processMany, 1);
							return;
						}
					}
				}

				nextQueued = false;
				next();
			}
		}


		nextQueued = true;
		processMany();
	}
}