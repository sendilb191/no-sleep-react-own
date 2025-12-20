import zipfile
p='android/gradle/wrapper/gradle-wrapper.jar'
with zipfile.ZipFile(p) as z:
    names=z.namelist()
    print('\n'.join(names[:50]))
    print('\nTotal entries:', len(names))