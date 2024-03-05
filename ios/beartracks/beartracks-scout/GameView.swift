//
//  GameView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI
import AudioToolbox

struct GameView: View {
    @EnvironmentObject var controller: ScoutingController
    @State private var holdLengths: (TimeInterval, TimeInterval, TimeInterval) = (0.0, 0.0, 0.0)
    @State private var timer: Timer?
    @State private var actionState: ActionState = .neutral
    @State private var ballOffset: CGSize = .zero
    
    enum ActionState {
        case neutral, intake, travel, outtake
    }
    
    var body: some View {
        NavigationStack {
            if controller.getTeamNumber() != "--" && controller.getMatchNumber() != 0 {
                VStack {
                    GeometryReader { geometry in
                        VStack {
                            HStack {
                                Spacer()
                                VStack {
                                    Text("intake")
                                    Text(String(format: "%.1f", holdLengths.0))
                                }
                                Spacer()
                                VStack {
                                    Text("move")
                                    Text(String(format: "%.1f", holdLengths.1))
                                }
                                Spacer()
                                VStack {
                                    Text("outtake")
                                    Text(String(format: "%.1f", holdLengths.2))
                                }
                                Spacer()
                            }
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding(.top)
                            Spacer()
                            ZStack {
                                HStack {
                                    Spacer()
                                    Capsule()
                                        .fill(Color.init(red: 0.1, green: 0.1, blue: 0.1))
                                        .frame(width: geometry.size.width * 0.8, height: 60)
                                    Spacer()
                                }
                                Circle()
                                    .fill(getBallColor(position: actionState, height: geometry.size.height))
                                    .overlay (
                                        getUIImage(position: actionState, height: geometry.size.height)
                                            .colorMultiply(Color.init(red: 0.1, green: 0.1, blue: 0.1))
                                            .bold()
                                    )
                                    .frame(width: 50, height: 50)
                                    .offset(x: ballOffset.width, y: 0)
                                    .gesture(
                                        DragGesture()
                                            .onChanged { value in
                                                self.updateBallOffset(dragValue: value, totalWidth: geometry.size.width * 0.8, totalHeight: geometry.size.height)
                                                self.updateTogglePosition(totalWidth: geometry.size.width * 0.8, height: geometry.size.height)
                                            }
                                            .onEnded { _ in
                                                withAnimation {
                                                    if abs(self.ballOffset.height) >= geometry.size.height * 0.2 {
                                                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                                                    }
                                                    self.ballOffset = .zero
                                                    self.actionState = .neutral
                                                }
                                            }
                                    )
                                    .modifier(PressModifier(onPress: { self.actionState = .travel }, onRelease: {
                                        if self.ballOffset.height >= geometry.size.height * 0.2 {
                                            UINotificationFeedbackGenerator().notificationOccurred(.success)
                                            controller.clearSpeaker()
                                            self.holdLengths = (0, 0, 0)
                                        } else if self.ballOffset.height <= geometry.size.height * -0.2 {
                                            if abs(self.ballOffset.height) >= geometry.size.height * 0.475 {
                                                UINotificationFeedbackGenerator().notificationOccurred(.error)
                                                controller.clearShuttle()
                                            } else {
                                                UINotificationFeedbackGenerator().notificationOccurred(.warning)
                                                controller.clearAmplifier()
                                            }
                                            self.holdLengths = (0, 0, 0)
                                        }
                                        self.actionState = .neutral
                                    }))
                                if controller.matchTimes.count == 0 {
                                    VStack {
                                        Spacer()
                                        Text("↑ shuttle / other ↑")
                                        Text("amplifier")
                                        Spacer()
                                        Spacer()
                                        Spacer()
                                        HStack {
                                            Spacer()
                                            Text("intake")
                                            Spacer()
                                            Text("travel")
                                            Spacer()
                                            Text("outtake")
                                            Spacer()
                                        }
                                        Spacer()
                                        Text("speaker")
                                        Spacer()
                                    }
                                }
                            }
                            .padding(.bottom)
                            .onChange(of: actionState) { value in
                                self.timer?.invalidate()
                                self.timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
                                    if value == .intake {
                                        self.holdLengths.0 += 0.1
                                        controller.times[0] = self.holdLengths.0
                                    } else if value == .travel {
                                        self.holdLengths.1 += 0.1
                                        controller.times[1] = self.holdLengths.1
                                    } else if value == .outtake {
                                        self.holdLengths.2 += 0.1
                                        controller.times[2] = self.holdLengths.2
                                    }
                                }
                                UIImpactFeedbackGenerator(style: .soft).impactOccurred()
                            }
                            Spacer()
                            Button("go to endgame") {
                                controller.advanceToTab(tab: .end)
                            }
                            .padding()
                            .buttonStyle(.bordered)
                            Text("match \(controller.getMatchNumber()) • team \(controller.getTeamNumber())")
                                .frame(maxWidth: .infinity, alignment: .center)
                                .padding(.bottom)
                        }
                        .frame(width: geometry.size.width, height: geometry.size.height)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                .navigationTitle("Match Scouting")
            } else {
                Text("Please select a match number and event code on the start tab.")
                    .padding()
                    .navigationTitle("Match Scouting")
            }
        }
    }
    
    private func updateTogglePosition(totalWidth: CGFloat, height: CGFloat) {
        let position: CGFloat
        if ballOffset.width > 0 {
            position = ((ballOffset.width + 25) + (totalWidth * 0.5)) / totalWidth
        } else {
            position = ((ballOffset.width - 25) + (totalWidth * 0.5)) / totalWidth
        }
        
        switch position {
        case ..<0.25:
            self.actionState = .intake
        case 0.25..<0.75:
            self.actionState = .travel
        default:
            self.actionState = .outtake
        }
    }

    private func updateBallOffset(dragValue: DragGesture.Value, totalWidth: CGFloat, totalHeight: CGFloat) {
        if abs(self.ballOffset.height) > totalHeight * 0.2 && abs(dragValue.translation.height) <= totalHeight * 0.2 {
            UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
        } else if abs(self.ballOffset.height) <= totalHeight * 0.2 && abs(dragValue.translation.height) > totalHeight * 0.2 {
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        }
        
        let newOffset = CGSize(
            width: min(max(dragValue.translation.width, (totalWidth * -0.5) + 30), (totalWidth * 0.5) - 30),
            height: dragValue.translation.height
        )

        self.ballOffset = newOffset
    }
    
    private func getUIImage(position: ActionState, height: CGFloat) -> Image {
        if abs(self.ballOffset.height) >= height * 0.2 {
            if self.ballOffset.height < 0 {
                if abs(self.ballOffset.height) >= height * 0.475 {
                    return Image(systemName: "airplane")
                } else {
                    return Image(systemName: "speaker.plus")
                }
            } else {
                return Image(systemName: "speaker.wave.2")
            }
        } else {
            switch position {
            case .neutral:
                return Image(systemName: "arrow.left.and.right")
            case .intake:
                return Image(systemName: "tray.and.arrow.down.fill")
            case .travel:
                return Image(systemName: "arrow.up.and.down.and.arrow.left.and.right")
            case .outtake:
                return Image(systemName: "paperplane.fill")
            }
        }
    }
    
    private func getBallColor(position: ActionState, height: CGFloat) -> Color {
        if abs(self.ballOffset.height) >= height * 0.2 {
            if self.ballOffset.height < 0 {
                if abs(self.ballOffset.height) >= height * 0.475 {
                    return Color.init(red: 254/255, green: 128/255, blue: 25/255)
                } else {
                    return Color.init(red: 250/255, green: 189/255, blue: 47/255)
                }
            } else {
                return Color.init(red: 184/255, green: 187/255, blue: 38/255)
            }
        } else {
            switch position {
            case .neutral:
                return Color.init(red: 251/255, green: 241/255, blue: 199/255)
            case .intake:
                return Color.init(red: 69/255, green: 133/255, blue: 136/255)
            case .travel:
                return Color.init(red: 177/255, green: 98/255, blue: 134/255)
            case .outtake:
                return Color.init(red: 104/255, green: 157/255, blue: 106/255)
            }
        }
    }
}

#Preview {
    GameView()
        .environmentObject(ScoutingController())
}
