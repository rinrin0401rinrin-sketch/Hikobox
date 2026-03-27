import Foundation
import PDFKit

struct Box: Encodable {
    let name: String
    let x: Double
    let y: Double
    let width: Double
    let height: Double
}

let args = CommandLine.arguments
guard args.count >= 4 else {
    fputs("usage: swift tmp/page_name_boxes.swift <pdfPath> <pageNumber> <name1> [name2...]\n", stderr)
    exit(1)
}

let pdfPath = args[1]
guard let pageNumber = Int(args[2]), pageNumber >= 1 else {
    fputs("pageNumber must be a positive integer.\n", stderr)
    exit(1)
}

let names = Array(args.dropFirst(3))
guard let document = PDFDocument(url: URL(fileURLWithPath: pdfPath)),
      let page = document.page(at: pageNumber - 1),
      let text = page.string else {
    fputs("failed to open PDF or page text.\n", stderr)
    exit(1)
}

let nsText = text as NSString
var boxes: [Box] = []

for name in names {
    let range = nsText.range(of: name)
    guard range.location != NSNotFound,
          let selection = page.selection(for: range) else {
        fputs("name not found: \(name)\n", stderr)
        exit(2)
    }

    let bounds = selection.bounds(for: page)
    boxes.append(
        Box(
            name: name,
            x: bounds.origin.x,
            y: bounds.origin.y,
            width: bounds.width,
            height: bounds.height
        )
    )
}

let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .withoutEscapingSlashes, .sortedKeys]
let data = try encoder.encode(boxes)
FileHandle.standardOutput.write(data)
FileHandle.standardOutput.write(Data([0x0a]))
