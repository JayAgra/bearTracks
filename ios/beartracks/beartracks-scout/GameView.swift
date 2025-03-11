//
//  GameView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import AudioToolbox
import SwiftUI

public enum ActionState {
    case neutral, intake, travel, outtake
}

public enum ReleaseState {
    case neutral, l0, l1, l2, l3, net
}

struct GameView: View {
    @EnvironmentObject var controller: ScoutingController
    
    var body: some View {
        VStack {
            if controller.getTeamNumber() != "--" && controller.getMatchNumber() != 0 {
                VStack {
                    GeometryReader { geometry in
                        VStack {
                            switch controller.selectedGameInterface {
                            case 1: GameViewButtonTimer(geometry: geometry, controller: controller)
                            case _: GameViewShifterTimer(geometry: geometry, controller: controller) // 0
                            }
                            Spacer()
                            Button("Start Endgame") {
                                controller.advanceToTab(tab: .end)
                            }
                            .padding()
                            .buttonStyle(.bordered)
                            Text("Match \(controller.getMatchNumber()) • Team \(controller.getTeamNumber())")
                                .frame(maxWidth: .infinity, alignment: .center)
                                .padding(.bottom)
                        }
                        .frame(width: geometry.size.width, height: geometry.size.height)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                .navigationTitle("Match Scouting")
            } else {
                Text("Please select a match and team number on the start tab.")
                    .padding()
                    .navigationTitle("Match Scouting")
            }
        }
    }
}

struct GameViewButtonTimer: View {
    var geometry: GeometryProxy
    var controller: ScoutingController
    @State var holdLengths: (TimeInterval, TimeInterval, TimeInterval) = (0.0, 0.0, 0.0)
    @State var timer: Timer?
    @State var actionState: ActionState = .neutral
    
    var body: some View {
        VStack {
            HStack {
                Spacer()
                VStack {
                    Text("Intake")
                        .foregroundStyle(Color.gray)
                    Text(String(format: "%.1f", holdLengths.0))
                        .foregroundStyle(Color.init(red: 69 / 255, green: 133 / 255, blue: 136 / 255))
                }
                Spacer()
                VStack {
                    Text("Travel")
                        .foregroundStyle(Color.gray)
                    Text(String(format: "%.1f", holdLengths.1))
                        .foregroundStyle(Color.init(red: 177 / 255, green: 98 / 255, blue: 134 / 255))
                }
                Spacer()
                VStack {
                    Text("Outtake")
                        .foregroundStyle(Color.gray)
                    Text(String(format: "%.1f", holdLengths.2))
                        .foregroundStyle(Color.init(red: 104 / 255, green: 157 / 255, blue: 106 / 255))
                }
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .center)
            .padding(.top)
            HStack {
                Spacer()
                Button(action: {
                    UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
                }, label: {
                    Label("Intake", systemImage: "tray.and.arrow.down.fill")
                        .foregroundStyle(Color.init(red: 69 / 255, green: 133 / 255, blue: 136 / 255))
                        .labelStyle(.iconOnly)
                        .font(.custom("button", size: geometry.size.width * 0.125))
                        .frame(width: geometry.size.width * 0.2, height: geometry.size.height * 0.25)
                })
                .simultaneousGesture(DragGesture(minimumDistance: 0).onChanged({ _ in actionState = .intake}).onEnded({ _ in actionState = .neutral}))
                .buttonStyle(.bordered).buttonBorderShape(.roundedRectangle(radius: 5))
                Spacer()
                Button(action: {
                    UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
                }, label: {
                    Label("Travel", systemImage: "arrow.up.and.down.and.arrow.left.and.right")
                        .foregroundStyle(Color.init(red: 177 / 255, green: 98 / 255, blue: 134 / 255))
                        .labelStyle(.iconOnly)
                        .font(.custom("button", size: geometry.size.width * 0.125))
                        .frame(width: geometry.size.width * 0.2, height: geometry.size.height * 0.25)
                })
                .simultaneousGesture(DragGesture(minimumDistance: 0).onChanged({ _ in actionState = .travel}).onEnded({ _ in actionState = .neutral}))
                .buttonStyle(.bordered).buttonBorderShape(.roundedRectangle(radius: 5))
                Spacer()
                Button(action: {
                    UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
                }, label: {
                    Label("Outtake", systemImage: "paperplane.fill")
                        .foregroundStyle(Color.init(red: 104 / 255, green: 157 / 255, blue: 106 / 255))
                        .labelStyle(.iconOnly)
                        .font(.custom("button", size: geometry.size.width * 0.125))
                        .frame(width: geometry.size.width * 0.2, height: geometry.size.height * 0.25)
                })
                .simultaneousGesture(DragGesture(minimumDistance: 0).onChanged({ _ in actionState = .outtake}).onEnded({ _ in actionState = .neutral}))
                .buttonStyle(.bordered).buttonBorderShape(.roundedRectangle(radius: 5))
                Spacer()
            }
            .onChange(of: actionState) { value in
                self.timer?.invalidate()
                self.timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
                    if value == .intake {
                        self.holdLengths.0 += 0.1
                    } else if value == .travel {
                        self.holdLengths.1 += 0.1
                    } else if value == .outtake {
                        self.holdLengths.2 += 0.1
                    }
                }
                UIImpactFeedbackGenerator(style: .soft).impactOccurred()
            }
            .padding(.vertical)
            Spacer()
            HStack {
                Spacer()
                Button(action: {
                    controller.times = [self.holdLengths.0, self.holdLengths.1, self.holdLengths.2];
                    controller.clearScore(scoreType: 4); self.holdLengths = (0, 0, 0)
                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                }, label: {
                    Label("Algae", systemImage: "leaf.fill")
                        .foregroundStyle(Color.init(red: 184 / 255, green: 187 / 255, blue: 38 / 255))
                        .labelStyle(.iconOnly)
                        .font(.custom("button", size: geometry.size.width * 0.125))
                        .frame(width: geometry.size.width * 0.35, height: geometry.size.width * 0.4)
                }).buttonStyle(.bordered).buttonBorderShape(.roundedRectangle(radius: 5))
                Spacer()
                VStack {
                    Button(action: {
                        controller.times = [self.holdLengths.0, self.holdLengths.1, self.holdLengths.2];
                        controller.clearScore(scoreType: 5); self.holdLengths = (0, 0, 0)
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                    }, label: {
                        Label("Level 1", systemImage: "1.circle.fill")
                            .foregroundStyle(Color.init(red: 251 / 255, green: 241 / 255, blue: 199 / 255))
                            .labelStyle(.iconOnly)
                            .font(.custom("button", size: geometry.size.width * 0.1))
                            .frame(width: geometry.size.width * 0.175, height: geometry.size.width * 0.175)
                    }).buttonStyle(.bordered).buttonBorderShape(.roundedRectangle(radius: 5))
                    Button(action: {
                        controller.times = [self.holdLengths.0, self.holdLengths.1, self.holdLengths.2];
                        controller.clearScore(scoreType: 7); self.holdLengths = (0, 0, 0)
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                    }, label: {
                        Label("Level 3", systemImage: "3.circle.fill")
                            .foregroundStyle(Color.init(red: 251 / 255, green: 241 / 255, blue: 199 / 255))
                            .labelStyle(.iconOnly)
                            .font(.custom("button", size: geometry.size.width * 0.1))
                            .frame(width: geometry.size.width * 0.175, height: geometry.size.width * 0.175)
                    }).buttonStyle(.bordered).buttonBorderShape(.roundedRectangle(radius: 5))
                }
                VStack {
                    Button(action: {
                        controller.times = [self.holdLengths.0, self.holdLengths.1, self.holdLengths.2];
                        controller.clearScore(scoreType: 6); self.holdLengths = (0, 0, 0)
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                    }, label: {
                        Label("Level 2", systemImage: "2.circle.fill")
                            .foregroundStyle(Color.init(red: 251 / 255, green: 241 / 255, blue: 199 / 255))
                            .labelStyle(.iconOnly)
                            .font(.custom("button", size: geometry.size.width * 0.1))
                            .frame(width: geometry.size.width * 0.175, height: geometry.size.width * 0.175)
                    }).buttonStyle(.bordered).buttonBorderShape(.roundedRectangle(radius: 5))
                    Button(action: {
                        controller.times = [self.holdLengths.0, self.holdLengths.1, self.holdLengths.2];
                        controller.clearScore(scoreType: 8); self.holdLengths = (0, 0, 0)
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                    }, label: {
                        Label("Level 4", systemImage: "4.circle.fill")
                            .foregroundStyle(Color.init(red: 251 / 255, green: 241 / 255, blue: 199 / 255))
                            .labelStyle(.iconOnly)
                            .font(.custom("button", size: geometry.size.width * 0.1))
                            .frame(width: geometry.size.width * 0.175, height: geometry.size.width * 0.175)
                    }).buttonStyle(.bordered).buttonBorderShape(.roundedRectangle(radius: 5))
                }
                Spacer()
            }
            Spacer()
        }
    }
}

struct GameViewShifterTimer: View {
    var geometry: GeometryProxy
    var controller: ScoutingController
    @State var ballOffset: CGSize = .zero
    @State var holdLengths: (TimeInterval, TimeInterval, TimeInterval) = (0.0, 0.0, 0.0)
    @State var timer: Timer?
    @State var actionState: ActionState = .neutral
    @State var releaseState: ReleaseState = .neutral
    
    var body: some View {
        ZStack {
            HStack {
                Spacer()
                VStack {
                    Text("Intake")
                        .foregroundStyle(Color.gray)
                    Text(String(format: "%.1f", holdLengths.0))
                        .foregroundStyle(Color.init(red: 69 / 255, green: 133 / 255, blue: 136 / 255))
                }
                Spacer()
                VStack {
                    Text("Travel")
                        .foregroundStyle(Color.gray)
                    Text(String(format: "%.1f", holdLengths.1))
                        .foregroundStyle(Color.init(red: 177 / 255, green: 98 / 255, blue: 134 / 255))
                }
                Spacer()
                VStack {
                    Text("Outtake")
                        .foregroundStyle(Color.gray)
                    Text(String(format: "%.1f", holdLengths.2))
                        .foregroundStyle(Color.init(red: 104 / 255, green: 157 / 255, blue: 106 / 255))
                }
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .center)
            .padding(.top)
        }
        Spacer()
        ZStack {
            HStack {
                Spacer()
                Capsule()
                    .fill(Color.init(red: 0.1, green: 0.1, blue: 0.1))
                    .frame(width: geometry.size.width * 0.7, height: geometry.size.width * 0.15)
                Spacer()
            }
            VStack {
                Capsule()
                    .fill(Color.init(red: 0.1, green: 0.1, blue: 0.1))
                    .frame(width: geometry.size.width * 0.9, height: geometry.size.width * 0.15)
                    .rotationEffect(Angle(radians: Double.pi * 0.5))
                    .offset(x: geometry.size.width * 0.275)
            }
            VStack {
                Capsule()
                    .fill(Color.init(red: 0.1, green: 0.1, blue: 0.1))
                    .frame(width: geometry.size.width * 0.25, height: geometry.size.width * 0.15)
                    .rotationEffect(Angle(radians: Double.pi * -0.25))
                    .offset(x: geometry.size.width * 0.215, y: -27.5)
            }
            VStack {
                Capsule()
                    .fill(Color.init(red: 0.1, green: 0.1, blue: 0.1))
                    .frame(width: geometry.size.width * 0.25, height: geometry.size.width * 0.15)
                    .rotationEffect(Angle(radians: Double.pi * 0.25))
                    .offset(x: geometry.size.width * 0.215, y: 27.5)
            }
            VStack { // REFACTOR LATER
                Spacer(); Spacer()
                Text("Algae")
                    .foregroundStyle(releaseState == .net ? Color.init(red: 177 / 255, green: 98 / 255, blue: 134 / 255) : Color.gray)
                Spacer()
                Text("L4")
                    .foregroundStyle(releaseState == .l3 ? Color.init(red: 69 / 255, green: 133 / 255, blue: 136 / 255) : Color.gray)
                Spacer()
                Text("L3")
                    .foregroundStyle(releaseState == .l2 ? Color.init(red: 104 / 255, green: 157 / 255, blue: 106 / 255) : Color.gray)
                Spacer()
                Text("L2")
                    .foregroundStyle(releaseState == .l1 ? Color.init(red: 69 / 255, green: 133 / 255, blue: 136 / 255) : Color.gray)
                Spacer()
                Text("L1")
                    .foregroundStyle(releaseState == .l0 ? Color.init(red: 177 / 255, green: 98 / 255, blue: 134 / 255) : Color.gray)
                Spacer(); Spacer()
            }
            .offset(x: geometry.size.width * 0.425)
            Circle()
                .fill(getBallColor(position: actionState, releasePosition: releaseState))
                .overlay(
                    
                    getUIImage(position: actionState, releasePosition: releaseState)
                        .colorMultiply(Color.init(red: 0.1, green: 0.1, blue: 0.1))
                        .font(Font.body.bold())
                )
                .frame(width: geometry.size.width * 0.125, height: geometry.size.width * 0.125)
                .offset(x: ballOffset.width, y: ballOffset.height * -1)
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            self.updateBallOffset(
                                dragValue: value, totalWidth: geometry.size.width * 0.7,
                                totalHeight: geometry.size.width * 0.7)
                            self.updateTogglePosition(totalWidth: geometry.size.width * 0.7, height: geometry.size.height)
                        }
                        .onEnded { _ in
                            withAnimation(.linear(duration: 0.2)) {
                                if abs(self.ballOffset.height) >= geometry.size.height * 0.2 {
                                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                                }
                                self.ballOffset.height = 0
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.125) {
                                withAnimation {
                                    self.ballOffset.width = 0
                                    self.actionState = .neutral
                                }
                            }
                        }
                )
                .modifier(
                    PressModifier(
                        onPress: { self.actionState = .travel },
                        onRelease: {
                            switch releaseState {
                            case .neutral:
                                return;
                            case .l0:
                                controller.times = [self.holdLengths.0, self.holdLengths.1, self.holdLengths.2]
                                UINotificationFeedbackGenerator().notificationOccurred(.success)
                                controller.clearScore(scoreType: 5); self.holdLengths = (0, 0, 0)
                            case .l1:
                                controller.times = [self.holdLengths.0, self.holdLengths.1, self.holdLengths.2]
                                UINotificationFeedbackGenerator().notificationOccurred(.warning)
                                controller.clearScore(scoreType: 6); self.holdLengths = (0, 0, 0)
                            case .l2:
                                controller.times = [self.holdLengths.0, self.holdLengths.1, self.holdLengths.2]
                                UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
                                controller.clearScore(scoreType: 7); self.holdLengths = (0, 0, 0)
                            case .l3:
                                controller.times = [self.holdLengths.0, self.holdLengths.1, self.holdLengths.2]
                                UINotificationFeedbackGenerator().notificationOccurred(.warning)
                                controller.clearScore(scoreType: 8); self.holdLengths = (0, 0, 0)
                            case .net:
                                controller.times = [self.holdLengths.0, self.holdLengths.1, self.holdLengths.2]
                                UINotificationFeedbackGenerator().notificationOccurred(.success)
                                controller.clearScore(scoreType: 4); self.holdLengths = (0, 0, 0)
                            }
                            self.actionState = .neutral
                            self.releaseState = .neutral
                        }
                    )
                )
        }
        .padding(.bottom)
        .onChange(of: actionState) { value in
            self.timer?.invalidate()
            self.timer = Timer.scheduledTimer(withTimeInterval: 0.01, repeats: true) { _ in
                if value == .intake {
                    self.holdLengths.0 += 0.01
                } else if value == .travel {
                    self.holdLengths.1 += 0.01
                } else if value == .outtake {
                    self.holdLengths.2 += 0.01
                }
            }
            UIImpactFeedbackGenerator(style: .soft).impactOccurred()
        }
        .onAppear {
            holdLengths = (0.0, 0.0, 0.0)
        }
    }
    
    private func updateBallOffset(dragValue: DragGesture.Value, totalWidth: CGFloat, totalHeight: CGFloat) {
        if self.ballOffset.width >= totalWidth * 0.390625 {
            if abs(self.ballOffset.height) < totalHeight * 0.1875 && abs(dragValue.translation.height) >= totalHeight * 0.1875 {
                UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
            } else if abs(self.ballOffset.height) < totalHeight * 0.375 && abs(dragValue.translation.height) >= totalHeight * 0.375 {
                UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
            }
            if abs(self.ballOffset.height) > totalHeight * 0.1875 && abs(dragValue.translation.height) < totalHeight * 0.1875 {
                UIImpactFeedbackGenerator(style: .soft).impactOccurred()
            } else if abs(self.ballOffset.height) > totalHeight * 0.375 && abs(dragValue.translation.height) < totalHeight * 0.375 {
                UIImpactFeedbackGenerator(style: .soft).impactOccurred()
            }
        }
        
        var newOffset: CGSize;
        let newWidth = min(max(dragValue.translation.width, (totalWidth * -0.3875)), (totalWidth * 0.3875))
        let newHeight = min(max(dragValue.translation.height * -1, (totalWidth * -0.54)), (totalWidth * 0.54))
        if newWidth >= totalWidth * 0.3375 {
            newOffset = CGSize(
                width: totalWidth * 0.3925,
                height: newHeight
            )
        } else if newWidth >= totalWidth * (0.215 + (0.125 / sqrt(2))) {
            if abs(newHeight) <= totalWidth * 0.225 {
                newOffset = CGSize(
                    width: newWidth,
                    height: (newWidth - (totalWidth * (0.215 + (0.125 / sqrt(2)))))
                )
            } else {
                newOffset = CGSize(
                    width: totalWidth * 0.3925,
                    height: newHeight
                )
            }
        } else {
            newOffset = CGSize(
                width: newWidth,
                height: 0
            )
        }

        self.ballOffset = newOffset
                      
        if self.ballOffset.width >= totalWidth * 0.325 {
            if abs(self.ballOffset.height) > totalWidth * 0.1875 {
                if self.ballOffset.height > 0 {
                    if self.ballOffset.height < totalWidth * 0.375 {
                        releaseState = .l3
                    } else {
                        releaseState = .net
                    }
                } else {
                    if self.ballOffset.height > totalWidth * -0.375 {
                        releaseState = .l1
                    } else {
                        releaseState = .l0
                    }
                }
            } else {
                self.releaseState = .l2
            }
            
        } else {
            self.releaseState = .neutral
        }
    }
    
    private func getUIImage(position: ActionState, releasePosition: ReleaseState) -> Image {
        if releasePosition != .neutral {
            switch releasePosition {
            case .l0:
                return Image(systemName: "1.circle.fill")
            case .l1:
                return Image(systemName: "2.circle.fill")
            case .l2:
                return Image(systemName: "3.circle.fill")
            case .l3:
                return Image(systemName: "4.circle.fill")
            case .net:
                return Image(systemName: "leaf.fill")
            case .neutral:
                return Image(systemName: "minus")
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
    
    private func getBallColor(position: ActionState, releasePosition: ReleaseState) -> Color {
        if releasePosition != .neutral {
            switch releasePosition {
            case .l0:
                return Color.init(red: 177 / 255, green: 98 / 255, blue: 134 / 255)
            case .l1:
                return Color.init(red: 69 / 255, green: 133 / 255, blue: 136 / 255)
            case .l2:
                return Color.init(red: 104 / 255, green: 157 / 255, blue: 106 / 255) // middle
            case .l3:
                return Color.init(red: 69 / 255, green: 133 / 255, blue: 136 / 255)
            case .net:
                return Color.init(red: 177 / 255, green: 98 / 255, blue: 134 / 255)
            case .neutral:
                return Color.init(red: 251 / 255, green: 241 / 255, blue: 199 / 255)
            }
        } else {
            switch position {
            case .neutral:
                return Color.init(red: 251 / 255, green: 241 / 255, blue: 199 / 255)
            case .intake:
                return Color.init(red: 69 / 255, green: 133 / 255, blue: 136 / 255)
            case .travel:
                return Color.init(red: 177 / 255, green: 98 / 255, blue: 134 / 255)
            case .outtake:
                return Color.init(red: 104 / 255, green: 157 / 255, blue: 106 / 255)
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
}

#Preview {
    GameView()
        .environmentObject(ScoutingController())
}
