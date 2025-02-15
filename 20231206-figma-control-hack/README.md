# Figma Control Hack

Method for controlling external apps/devices from Figma.

Figma does not enable direct control of external apps and devices. The only method to trigger an external event is by a "link" action, requesting a browser page. We can use this to enable triggering external actions:

- Create an application that processes the command line input that Figma will pass
- Set this application as the default browser:
  - A tool that can be used for this is "Portable Registrator": https://github.com/SiL3NC3/PortableRegistrator
- When a Figma link is triggered, it will be delegated to the custom app, which can then perform the actions required

## Sample code

```
#include <stdio.h>
#include <windows.h>

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance,
                   PSTR szCmdParam, int iCmdShow)
{
    // action here
    // Write to a file, just to prove the concept
    FILE *f = fopen("C:\\lib\\figma_control_hack\\url.txt", "w");
    if (f == NULL)
    {
        printf("Error opening file!\n");
        exit(1);
    }

    /* write command line params */
    const char *text = szCmdParam;
    fprintf(f, "Params: %s\n", text);

    fclose(f);
    return 0;
}
```

Register the app as the default browser, and it will be started when Figma activates a link.

## Notes

- This works and has been tested on Windows only
- This needs to be used with the Figma app, not from a browser, since that will just open a new tab
