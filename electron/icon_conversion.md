# Icon Conversion Instructions

## SVG to ICO Conversion Options

The SVG file `stitchpay_logo.svg` needs to be converted to an ICO file for your application packaging. 
Here are several ways to do this:

### Option 1: Use an Online Converter

1. Visit one of these online converters:
   - https://convertio.co/svg-ico/
   - https://www.aconvert.com/icon/svg-to-ico/
   - https://cloudconvert.com/svg-to-ico

2. Upload the SVG file (`stitchpay_logo.svg`)
3. Configure settings to include multiple sizes (16x16, 32x32, 48x48, 64x64, 128x128)
4. Download the resulting ICO file
5. Save it as `icon.ico` in the `electron` folder

### Option 2: Use Inkscape + ImageMagick (if installed)

If you have Inkscape and ImageMagick installed:

```powershell
# Export the SVG to multiple PNG sizes
$sizes = @(16, 32, 48, 64, 128, 256)
foreach ($size in $sizes) {
    inkscape -w $size -h $size stitchpay_logo.svg -o "logo_${size}.png"
}

# Convert the PNGs to an ICO file
magick convert logo_*.png icon.ico

# Clean up temporary PNG files
Remove-Item logo_*.png
```

### Option 3: Use Node.js-based tools

If you prefer a Node.js approach, you can install and use the following packages:

```powershell
npm install -g svg2png-cli
npm install -g png-to-ico

# Convert SVG to multiple PNG sizes
$sizes = @(16, 32, 48, 64, 128, 256)
foreach ($size in $sizes) {
    svg2png-cli -i stitchpay_logo.svg -o "logo_${size}.png" -w $size -h $size
}

# Convert PNGs to ICO
png-to-ico logo_*.png > icon.ico

# Clean up temporary files
Remove-Item logo_*.png
```

After generating the icon.ico file, place it in the electron folder to be used in your application build.
