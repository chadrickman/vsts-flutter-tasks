"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const task = require("vsts-task-lib/task");
const FLUTTER_TOOL_PATH_ENV_VAR = 'FlutterToolPath';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Check flutter environment
        var flutterPath = task.getVariable(FLUTTER_TOOL_PATH_ENV_VAR) || process.env[FLUTTER_TOOL_PATH_ENV_VAR];
        flutterPath = path.join(flutterPath, "flutter");
        if (!flutterPath) {
            throw new Error(`The '${FLUTTER_TOOL_PATH_ENV_VAR}' environment variable must be set before using this task (you can use 'flutterinstall' task).`);
        }
        // 2. Clean if requested
        let shouldClean = task.getBoolInput('clean', false);
        if (shouldClean) {
            task.debug(`Cleaning`);
            clean(flutterPath);
        }
        // 3. Get target
        let target = task.getInput('target', true);
        // 4. Move current working directory to project
        let projectDirectory = task.getPathInput('projectDirectory', false, false);
        if (projectDirectory) {
            task.debug(`Moving to ${projectDirectory}`);
            task.cd(projectDirectory);
        }
        // 5. Get common input
        let buildName = task.getInput('buildName', false);
        let buildNumber = task.getInput('buildNumber', false);
        // 6. Builds
        if (target === "all" || target === "ios") {
            let targetPlatform = task.getInput('iosTargetPlatform', false);
            let codesign = task.getBoolInput('iosCodesign', false);
            buildIpa(flutterPath, targetPlatform == "simulator", codesign, buildName, buildNumber);
        }
        if (target === "all" || target === "apk") {
            let targetPlatform = task.getInput('apkTargetPlatform', false);
            buildApk(flutterPath, targetPlatform, buildName, buildNumber);
        }
    });
}
function clean(flutter) {
    return task.exec(flutter, ["clean"]);
}
function buildApk(flutter, targetPlatform, buildName, buildNumber) {
    var args = [
        "build",
        "apk",
        "--pub",
        "--release"
    ];
    if (targetPlatform) {
        args.push("--target-platform");
        args.push(targetPlatform);
    }
    if (buildName) {
        args.push("--build-name");
        args.push(buildName);
    }
    if (buildNumber) {
        args.push("--build-number");
        args.push(buildNumber);
    }
    return task.exec(flutter, args);
}
function buildIpa(flutter, simulator, codesign, buildName, buildNumber) {
    var args = [
        "build",
        "ios",
        "--pub",
        "--release"
    ];
    if (simulator) {
        args.push("--simulator");
    }
    else if (codesign) {
        args.push("--codesign");
    }
    if (buildName) {
        args.push("--build-name");
        args.push(buildName);
    }
    if (buildNumber) {
        args.push("--build-number");
        args.push(buildNumber);
    }
    return task.exec(flutter, args);
}
main().catch(error => {
    task.setResult(task.TaskResult.Failed, error);
});