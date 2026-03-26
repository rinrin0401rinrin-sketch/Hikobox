import Foundation
import PDFKit

struct CliError: Error, CustomStringConvertible {
  let description: String
}

func parsePageSpec(_ raw: String, pageCount: Int) throws -> [Int] {
  if raw.contains("-") {
    let parts = raw.split(separator: "-", omittingEmptySubsequences: false)
    guard parts.count == 2,
          let start = Int(parts[0]),
          let end = Int(parts[1]),
          start >= 1,
          end >= start,
          end <= pageCount
    else {
      throw CliError(description: "Invalid page range: \(raw)")
    }
    return Array(start...end)
  }

  guard let page = Int(raw), page >= 1, page <= pageCount else {
    throw CliError(description: "Invalid page number: \(raw)")
  }

  return [page]
}

let arguments = CommandLine.arguments

guard arguments.count >= 3 else {
  fputs("usage: swift extract_pdf_text.swift <pdf-path> <page|start-end>\n", stderr)
  exit(1)
}

let pdfPath = arguments[1]
let pageSpec = arguments[2]
let pdfUrl = URL(fileURLWithPath: pdfPath)

guard let document = PDFDocument(url: pdfUrl) else {
  fputs("Failed to open PDF: \(pdfPath)\n", stderr)
  exit(1)
}

let pageCount = document.pageCount

do {
  let pages = try parsePageSpec(pageSpec, pageCount: pageCount)

  for pageNumber in pages {
    guard let page = document.page(at: pageNumber - 1) else {
      throw CliError(description: "Failed to load page \(pageNumber)")
    }

    let text = page.string ?? ""
    print("===== PAGE \(pageNumber) =====")
    print(text)
    if pageNumber != pages.last {
      print("")
    }
  }
} catch {
  fputs("\(error)\n", stderr)
  exit(1)
}
