import AppKit
import Foundation

struct Args {
    let inputPath: String
    let x: Int
    let y: Int
    let width: Int
    let height: Int
    let outputPath: String
}

func parseArgs() -> Args? {
    let args = CommandLine.arguments
    guard args.count == 7 else {
        fputs("usage: swift scripts/crop_rect.swift <inputImage> <x> <y> <width> <height> <outputJpg>\n", stderr)
        return nil
    }

    guard
        let x = Int(args[2]),
        let y = Int(args[3]),
        let width = Int(args[4]),
        let height = Int(args[5]),
        width > 0,
        height > 0
    else {
        fputs("x y width height must be integers, width and height > 0.\n", stderr)
        return nil
    }

    return Args(
        inputPath: args[1],
        x: x,
        y: y,
        width: width,
        height: height,
        outputPath: args[6]
    )
}

guard let config = parseArgs() else {
    exit(1)
}

let inputURL = URL(fileURLWithPath: config.inputPath)
guard
    let image = NSImage(contentsOf: inputURL),
    let tiffData = image.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiffData),
    let sourceCGImage = bitmap.cgImage
else {
    fputs("failed to load image at \(config.inputPath)\n", stderr)
    exit(1)
}

let cropRect = CGRect(x: config.x, y: config.y, width: config.width, height: config.height)
guard let cropped = sourceCGImage.cropping(to: cropRect) else {
    fputs("failed to crop rect \(cropRect).\n", stderr)
    exit(1)
}

let outputRep = NSBitmapImageRep(cgImage: cropped)
guard let jpegData = outputRep.representation(using: .jpeg, properties: [.compressionFactor: 0.92]) else {
    fputs("failed to encode jpeg.\n", stderr)
    exit(1)
}

let outputURL = URL(fileURLWithPath: config.outputPath)
try jpegData.write(to: outputURL)
print(outputURL.path)
