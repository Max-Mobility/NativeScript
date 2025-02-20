import {
    messageType as traceMessageType,
    categories as traceCategories,
    write as traceWrite
} from "../trace";

function isOrientationLandscape(orientation: number) {
    return orientation === UIDeviceOrientation.LandscapeLeft /* 3 */ ||
        orientation === UIDeviceOrientation.LandscapeRight /* 4 */;
}

function openFileAtRootModule(filePath: string): boolean {
    try {
        const appPath = ios.getCurrentAppPath();
        const path = filePath.replace("~", appPath);

        const controller = UIDocumentInteractionController.interactionControllerWithURL(NSURL.fileURLWithPath(path));
        controller.delegate = new ios.UIDocumentInteractionControllerDelegateImpl();

        return controller.presentPreviewAnimated(true);
    }
    catch (e) {
        traceWrite("Error in openFile", traceCategories.Error, traceMessageType.error);
    }

    return false;
}

export module ios {
    // TODO: remove for NativeScript 7.0
    export function getter<T>(_this: any, property: T | { (): T }): T {
        console.log("utils.ios.getter() is deprecated; use the respective native property instead");
        if (typeof property === "function") {
            return (<{ (): T }>property).call(_this);
        } else {
            return <T>property;
        }
    }

    export module collections {
        export function jsArrayToNSArray(str: string[]): NSArray<any> {
            return NSArray.arrayWithArray(<any>str);
        }

        export function nsArrayToJSArray(a: NSArray<any>): Array<Object> {
            const arr = [];
            if (a !== undefined) {
                let count = a.count;
                for (let i = 0; i < count; i++) {
                    arr.push(a.objectAtIndex(i));
                }
            }

            return arr;
        }
    }

    export function isLandscape(): boolean {
        console.log("utils.ios.isLandscape() is deprecated; use application.orientation instead");

        const deviceOrientation = UIDevice.currentDevice.orientation;
        const statusBarOrientation = UIApplication.sharedApplication.statusBarOrientation;

        const isDeviceOrientationLandscape = isOrientationLandscape(deviceOrientation);
        const isStatusBarOrientationLandscape = isOrientationLandscape(statusBarOrientation);

        return isDeviceOrientationLandscape || isStatusBarOrientationLandscape;
    }

    export const MajorVersion = NSString.stringWithString(UIDevice.currentDevice.systemVersion).intValue;

    export function openFile(filePath: string): boolean {
        console.log("utils.ios.openFile() is deprecated; use utils.openFile() instead");

        return openFileAtRootModule(filePath);
    }

    export function getCurrentAppPath(): string {
        const currentDir = __dirname;
        const tnsModulesIndex = currentDir.indexOf("/tns_modules");

        // Module not hosted in ~/tns_modules when bundled. Use current dir.
        let appPath = currentDir;
        if (tnsModulesIndex !== -1) {
            // Strip part after tns_modules to obtain app root
            appPath = currentDir.substring(0, tnsModulesIndex);
        }

        return appPath;
    }

    export function joinPaths(...paths: string[]): string {
        if (!paths || paths.length === 0) {
            return "";
        }

        return NSString.stringWithString(NSString.pathWithComponents(<any>paths)).stringByStandardizingPath;
    }

    export function getVisibleViewController(rootViewController: UIViewController): UIViewController {
        if (rootViewController.presentedViewController) {
            return getVisibleViewController(rootViewController.presentedViewController);
        }

        if (rootViewController.isKindOfClass(UINavigationController.class())) {
            return getVisibleViewController((<UINavigationController>rootViewController).visibleViewController);
        }

        if (rootViewController.isKindOfClass(UITabBarController.class())) {
            return getVisibleViewController(<UITabBarController>rootViewController);
        }

        return rootViewController;

    }

    export class UIDocumentInteractionControllerDelegateImpl extends NSObject implements UIDocumentInteractionControllerDelegate {
        public static ObjCProtocols = [UIDocumentInteractionControllerDelegate];
    
        public getViewController(): UIViewController {
            const app = UIApplication.sharedApplication;
    
            return app.keyWindow.rootViewController;
        }
    
        public documentInteractionControllerViewControllerForPreview(controller: UIDocumentInteractionController) {
            return this.getViewController();
        }
    
        public documentInteractionControllerViewForPreview(controller: UIDocumentInteractionController) {
            return this.getViewController().view;
        }
    
        public documentInteractionControllerRectForPreview(controller: UIDocumentInteractionController): CGRect {
            return this.getViewController().view.frame;
        }
    }
}
