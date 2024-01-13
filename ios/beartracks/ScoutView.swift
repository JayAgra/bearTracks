//
//  JustinView.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/12/24.
//

import SwiftUI

struct ScoutView: View {
    @ObservedObject var viewModel: ScoutViewModel = ScoutViewModel()
    @State private var pressOne: Bool = false
    @GestureState private var pressTwo: Bool = false
    @GestureState private var pressThree: Bool = false
    
    var body: some View {
        VStack {
            HStack {
                VStack {
                    Text(String(format: "%.1f", viewModel.times[0]))
                        .font(.largeTitle)
                    Button("intake", systemImage: "tray.and.arrow.down") {
                    }.modifier(PressModifier(onPress: {
                        viewModel.beginClick(buttonIndex: 0)
                    }, onRelease: {
                        viewModel.endClick(buttonIndex: 0)
                    }))
                    .font(.largeTitle)
                    .labelStyle(.iconOnly)
                    .buttonStyle(.bordered)
                }
                .padding()
                VStack {
                    Text(String(format: "%.1f", viewModel.times[1]))
                        .font(.largeTitle)
                    Button("move", systemImage: "arrow.up.and.down.and.arrow.left.and.right") {
                    }.modifier(PressModifier(onPress: {
                        viewModel.beginClick(buttonIndex: 1)
                    }, onRelease: {
                        viewModel.endClick(buttonIndex: 1)
                    }))
                    .font(.largeTitle)
                    .labelStyle(.iconOnly)
                    .buttonStyle(.bordered)
                }
                .padding()
                VStack {
                    Text(String(format: "%.1f", viewModel.times[2]))
                        .font(.largeTitle)
                    Button("outtake", systemImage: "tray.and.arrow.up") {
                    }.modifier(PressModifier(onPress: {
                        viewModel.beginClick(buttonIndex: 2)
                    }, onRelease: {
                        viewModel.endClick(buttonIndex: 2)
                    }))
                    .font(.largeTitle)
                    .labelStyle(.iconOnly)
                    .buttonStyle(.bordered)
                }
                .padding()
            }
            .padding(.bottom)
            HStack {
                Button("cycle", systemImage: "checkmark") {
                    viewModel.clearCycle()
                }
                .font(.title)
                .buttonStyle(.bordered)
                .foregroundStyle(Color.green)
            }
            HStack {
                Button("miss", systemImage: "xmark") {
                    viewModel.clearMiss()
                }
                .font(.title)
                .buttonStyle(.bordered)
                .foregroundStyle(Color.red)
            }
        }
    }
}

#Preview {
    ScoutView()
}
