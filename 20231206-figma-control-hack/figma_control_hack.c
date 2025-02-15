// #include <stdio.h>
// #include <windows.h>
// int main(int argc, char *argv[])
// {
//     int i;
//     printf("%d\n", argc);
//     for (i = 0; i < argc; i++)
//     {
//         printf("%s\n", argv[i]);
//     }

//     Sleep(3000);
//     return 0;
// }

#include <stdio.h>
#include <windows.h>

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance,
                   PSTR szCmdParam, int iCmdShow)
{
    // action here
    FILE *f = fopen("C:\\lib\\figma_control_hack\\url.txt", "w");
    if (f == NULL)
    {
        printf("Error opening file!\n");
        exit(1);
    }

    /* print some text */
    const char *text = szCmdParam;
    fprintf(f, "Some text: %s\n", text);

    /* print integers and floats */
    int i = 1;
    float pi = 3.1415927;
    fprintf(f, "Integer: %d, float: %f\n", i, pi);

    fclose(f);
    return 0;
}
