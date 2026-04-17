import AppKit
import Foundation
import PDFKit

struct Args {
    let pdfPath: String
    let pageNumber: Int
    let outputPath: String
    let targetWidth: Int
}

func parseArgs() -> Args? {
    let args = CommandLine.arguments
    guard args.count == 5 else {
        fputs("usage: swift scripts/render_pdf_page.swift <pdf> <pageNumber> <outputPng> <targetWidth>\n", stderr)
        return nil
    }

    guard let pageNumber = Int(args[2]), let targetWidth = Int(args[4]), pageNumber >= 1, targetWidth > 0 else {
        fputs("pageNumber and targetWidth must be positive integers.\n", stderr)
        return nil
    }

    return Args(
        pdfPath: args[1],
        pageNumber: pageNumber,
        outputPath: args[3],
        targetWidth: targetWidth
    )
}

guard let config = parseArgs() else {
    exit(1)
}

let pdfURL = URL(fileURLWithPath: config.pdfPath)
guard let document = PDFDocument(url: pdfURL) else {
    fputs("failed to open PDF at \(config.pdfPath)\n", stderr)
    exit(1)
}

let pageIndex = config.pageNumber - 1
guard let page = document.page(at: pageIndex) else {
    fputs("page \(config.pageNumber) not found.\n", stderr)
    exit(1)
}

let mediaBounds = page.bounds(for: .mediaBox)
let scale = CGFloat(config.targetWidth) / mediaBounds.width
let targetSize = NSSize(width: CGFloat(config.targetWidth), height: mediaBounds.height * scale)

guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: Int(targetSize.width.rounded()),
    pixelsHigh: Int(targetSize.height.rounded()),
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
) else {
    fputs("failed to create bitmap context.\n", stderr)
    exit(1)
}

bitmap.size = targetSize
NSGraphicsContext.saveGraphicsState()
guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
    fputs("failed to create graphics context.\n", stderr)
    exit(1)
}

NSGraphicsContext.current = context
context.cgContext.setFillColor(NSColor.white.cgColor)
context.cgContext.fill(CGRect(origin: .zero, size: targetSize))
context.cgContext.saveGState()
context.cgContext.scaleBy(x: scale, y: scale)
page.draw(with: .mediaBox, to: context.cgContext)
context.cgContext.restoreGState()
NSGraphicsContext.restoreGraphicsState()

guard let pngData = bitmap.representation(using: .png, properties: [:]) else {
    fputs("failed to encode png.\n", stderr)
    exit(1)
}

let outputURL = URL(fileURLWithPath: config.outputPath)
try pngData.write(to: outputURL)
print(outputURL.path)
