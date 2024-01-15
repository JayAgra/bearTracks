//
//  SubmitSheetView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct SubmitSheetView: View {
    @StateObject var controller: ScoutingController
    
    var body: some View {
        switch controller.submitSheetType {
        case .waiting:
            VStack {
                Spacer()
                if #available(iOS 17.0, *) {
                    ProgressView()
                        .controlSize(.extraLarge)
                        .padding()
                } else {
                    ProgressView()
                        .controlSize(.large)
                        .padding()
                }
                Text("submitting...")
                    .font(.title)
                Spacer()
            }
        case .done:
            VStack {
                Spacer()
                Label("done", systemImage: "checkmark.seal.fill")
                    .labelStyle(.iconOnly)
                    .font(.largeTitle)
                    .foregroundStyle(Color.green)
                    .padding()
                Text("done")
                    .font(.title)
                Spacer()
            }
        case .error:
            VStack {
                Spacer()
                Label("done", systemImage: "xmark.seal.fill")
                    .labelStyle(.iconOnly)
                    .font(.largeTitle)
                    .foregroundStyle(Color.red)
                    .padding()
                Text("error")
                    .font(.title)
                Spacer()
            }
        }
    }
}

#Preview {
    SubmitSheetView(controller: ScoutingController())
}
