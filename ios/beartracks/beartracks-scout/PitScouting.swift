//
//  PitScouting.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 2/4/25.
//

import SwiftUI
import PhotosUI
import UIKit

public enum PitScoutingState {
    case teamSelection, dataInput, images, submit
}

struct PitScouting: View {
    @ObservedObject public var controller: PitScoutingController = PitScoutingController()
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        switch controller.state {
        case .teamSelection:
            PitTeamSelection().environmentObject(controller)
        case .dataInput:
            PitDataInput().environmentObject(controller)
        case .images:
            PitImages().environmentObject(controller)
        case .submit:
            PitSubmit().environmentObject(controller)
        }
    }
}

struct PitTeamSelection: View {
    @EnvironmentObject var controller: PitScoutingController
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        VStack {
            if controller.allTeams.status == 1 && controller.scoutedTeams.0 == 1 {
                List(controller.allTeams.teams, id: \.number) { team in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(String(team.number))
                                .bold()
                            Text(String(team.nameShort))
                        }
                        Spacer()
                        VStack {
                            Spacer()
                            if controller.scoutedTeams.1.contains(team.number) {
                                Label("Complete", systemImage: "checkmark.circle.fill")
                                    .foregroundStyle(.green).labelStyle(.iconOnly)
                            } else {
                                Label("Incomplete", systemImage: "xmark.circle.fill")
                                    .foregroundStyle(.red).labelStyle(.iconOnly)
                            }
                            Spacer()
                        }
                    }
                    .contentShape(Rectangle())
                    .onTapGesture {
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                        controller.selectedTeam = team.number
                        controller.state = .dataInput
                    }
                }
                Button(action: {
                    dismiss()
                }, label: {
                    Label("Back", systemImage: "xmark")
                        .labelStyle(.titleOnly)
                }).buttonStyle(.bordered)
            } else if controller.allTeams.status == 2 || controller.scoutedTeams.0 == 2 {
                Spacer()
                Text("Failed to load teams")
                    .font(.title)
                    .padding()
                Button(action: {
                    dismiss()
                }, label: {
                    Label("Back", systemImage: "xmark")
                        .labelStyle(.titleOnly)
                }).buttonStyle(.bordered).padding()
                Spacer()
            } else {
                Spacer()
                ProgressView()
                Spacer()
            }
        }
        .onAppear {
            controller.getAllTeams()
            controller.getScoutedTeams()
        }
        .refreshable {
            controller.getAllTeams()
            controller.getScoutedTeams()
        }
    }
}

struct PitDataInput: View {
    @EnvironmentObject var controller: PitScoutingController
    @FocusState private var activeBox: ActiveBox?
    
    enum ActiveBox: Hashable {
        case notes
    }
    
    var body: some View {
        VStack {
            Form {
                Text("Pit Scouting • Team \(String(controller.selectedTeam))").padding()
                Section {
                    Text("Capabilities")
                    Toggle("Algae Processor", isOn: $controller.booleans.0)
                    Toggle("Algae Net", isOn: $controller.booleans.1)
                    Toggle("Coral Level 1", isOn: $controller.booleans.2)
                    Toggle("Coral Level 2", isOn: $controller.booleans.3)
                    Toggle("Coral Level 3", isOn: $controller.booleans.4)
                    Toggle("Coral Level 4", isOn: $controller.booleans.5)
                    Toggle("Shallow Cage", isOn: $controller.booleans.6)
                    Toggle("Deep Cage", isOn: $controller.booleans.7)
                }
                Section {
                    Text("Drivetrain")
                    Picker("Drive Type", selection: $controller.numericals.0) {
                        Text("Swerve").tag(0)
                        Text("West Coast").tag(1)
                        Text("Mecanum").tag(2)
                        Text("Omni").tag(3)
                        Text("Other (explain in notes)").tag(4)
                    }
                    .pickerStyle(.menu)
                    Picker("Swerve Modules", selection: $controller.numericals.1) {
                        Text("N/A (no swerve)").tag(0)
                        Text("SDS").tag(1)
                        Text("AndyMark").tag(2)
                        Text("REV").tag(3)
                        Text("Westcoast (X)").tag(4)
                        Text("Other (explain in notes").tag(5)
                    }
                    .pickerStyle(.menu)
                }
                Section {
                    Text("Favorite...")
                    Picker("Game Piece", selection: $controller.numericals.2) {
                        Text("Algae").tag(0)
                        Text("Coral").tag(1)
                    }
                    .pickerStyle(.menu)
                    Picker("Coral Location", selection: $controller.numericals.3) {
                        Text("N/A").tag(0)
                        Text("Level 1").tag(1)
                        Text("Level 2").tag(2)
                        Text("Level 3").tag(3)
                        Text("Level 4").tag(4)
                    }
                    .pickerStyle(.menu)
                    Picker("Cage", selection: $controller.numericals.4) {
                        Text("N/A").tag(0)
                        Text("Shallow").tag(1)
                        Text("Deep").tag(1)
                    }
                    .pickerStyle(.menu)
                }
                Section {
                    Text("Team's Estimations")
                    Stepper {
                        Text("Cycles per game (\(controller.numericals.5))")
                    } onIncrement: {
                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                        controller.numericals.5 += 1
                    } onDecrement: {
                        if controller.numericals.5 > 0 {
                            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                            controller.numericals.5 -= 1
                        } else {
                            UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                    Stepper {
                        Text("Auto algae (\(controller.numericals.6))")
                    } onIncrement: {
                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                        controller.numericals.6 += 1
                    } onDecrement: {
                        if controller.numericals.6 > 0 {
                            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                            controller.numericals.6 -= 1
                        } else {
                            UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                    Stepper {
                        Text("Auto coral (\(controller.numericals.7))")
                    } onIncrement: {
                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                        controller.numericals.7 += 1
                    } onDecrement: {
                        if controller.numericals.7 > 0 {
                            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                            controller.numericals.7 -= 1
                        } else {
                            UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                }
                Text("Remember that the responses you type are public and visible by the team you are writing about. Responses are associated with your account.").foregroundStyle(Color.yellow).onTapGesture { activeBox = nil }
                Section {
                    Text("Notes")
                    TextEditor(text: $controller.notes)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Color.gray, lineWidth: 1)
                        )
                        .frame(height: 150)
                        .padding([.leading, .trailing])
                        .focused($activeBox, equals: .notes)
                        .onTapGesture { activeBox = .notes }
                }
                .onTapGesture {
                    activeBox = nil
                }
                VStack {
                    Section {
                        if controller.notes.isEmpty {
                            Text("Please complete the entire form, including notes, before continuing.")
                        } else {
                            Button(action: {
                                controller.state = .images
                            }, label: {
                                Label("Continue to Images", systemImage: "camera")
                                    .labelStyle(.titleOnly)
                                    .frame(maxWidth: .infinity).padding()
                            })
                            .buttonStyle(.borderedProminent).padding([.top, .horizontal])
                        }
                    }
                    Section {
                        Button(action: {
                            controller.state = .teamSelection
                        }, label: {
                            Label("Return", systemImage: "camera")
                                .labelStyle(.titleOnly)
                                .frame(maxWidth: .infinity)
                        })
                        .buttonStyle(.bordered).padding()
                    }
                }
                .listRowInsets(EdgeInsets())
                .background(Color(UIColor.systemGroupedBackground))
            }
        }
    }
}

extension UIImage {
    func resized(percentage: CGFloat) -> UIImage? {
        let canvas = CGSize(width: size.width * percentage, height: size.height * percentage)
        let format = imageRendererFormat
        format.opaque = true
        return UIGraphicsImageRenderer(size: canvas, format: format).image {
            _ in draw(in: CGRect(origin: .zero, size: canvas))
        }
    }
}

struct PitImages: View {
    @EnvironmentObject var controller: PitScoutingController
    @State private var cameraPresentation: (Bool, Bool, Bool) = (false, false, false)
    
    var body: some View {
        VStack {
            HStack {
                Text("Images")
                    .font(.title)
                    .bold()
                    .padding()
                Spacer()
            }
            Text("Please keep in mind that the images you upload are public and associated with your account.").foregroundStyle(Color.yellow).padding()

            Spacer()
            Button(action: {
                if controller.selectedImage.0 == nil { cameraPresentation.0.toggle() } else { controller.selectedImage.0 = nil }
            }, label: {
                if controller.selectedImage.0 == nil {
                    Label("Take Photo", systemImage: "camera").font(.title3).frame(maxWidth: .infinity)
                } else {
                    Label("Clear Photo", systemImage: "trash").font(.title3).frame(maxWidth: .infinity)
                }
            }).padding().buttonStyle(.bordered)
            Button(action: {
                if controller.selectedImage.1 == nil { cameraPresentation.1.toggle() } else { controller.selectedImage.1 = nil }
            }, label: {
                if controller.selectedImage.1 == nil {
                    Label("Take Photo", systemImage: "camera").font(.title3).frame(maxWidth: .infinity)
                } else {
                    Label("Clear Photo", systemImage: "trash").font(.title3).frame(maxWidth: .infinity)
                }
            }).padding().buttonStyle(.bordered)
            Button(action: {
                if controller.selectedImage.2 == nil { cameraPresentation.2.toggle() } else { controller.selectedImage.2 = nil }
            }, label: {
                if controller.selectedImage.2 == nil {
                    Label("Take Photo", systemImage: "camera").font(.title3).frame(maxWidth: .infinity)
                } else {
                    Label("Clear Photo", systemImage: "trash").font(.title3).frame(maxWidth: .infinity)
                }
            }).padding().buttonStyle(.bordered)
            Spacer()
            Section {
                if controller.selectedImage.0 == nil && controller.selectedImage.1 == nil && controller.selectedImage.2 == nil {
                    Text("Please take at least one photo before submitting.").padding()
                } else {
                    Button(action: {
                        if controller.selectedImage.0 != nil {
                            controller.imageData.0 = controller.selectedImage.0?.resized(percentage: 0.25)?.jpegData(compressionQuality: 0.25)?.base64EncodedString() ?? nil
                        }
                        if controller.selectedImage.1 != nil {
                            controller.imageData.1 = controller.selectedImage.1?.resized(percentage: 0.25)?.jpegData(compressionQuality: 0.25)?.base64EncodedString() ?? nil
                        }
                        if controller.selectedImage.2 != nil {
                            controller.imageData.2 = controller.selectedImage.2?.resized(percentage: 0.25)?.jpegData(compressionQuality: 0.25)?.base64EncodedString() ?? nil
                        }
                        controller.submissionStatus = 0
                        controller.state = .submit
                    }, label: {
                        Label("Submit", systemImage: "camera")
                            .labelStyle(.titleOnly).frame(maxWidth: .infinity).padding()
                    })
                    .buttonStyle(.borderedProminent).padding([.top, .horizontal])
                }
                Button(action: {
                    controller.state = .dataInput
                }, label: {
                    Label("Return", systemImage: "camera")
                        .labelStyle(.titleOnly).frame(maxWidth: .infinity)
                })
                .buttonStyle(.bordered)
                .padding()
            }
        }
        .fullScreenCover(isPresented: $cameraPresentation.0) {
            CameraView(isPresented: $cameraPresentation.0, selectedImage: $controller.selectedImage.0)
        }
        .fullScreenCover(isPresented: $cameraPresentation.1) {
            CameraView(isPresented: $cameraPresentation.1, selectedImage: $controller.selectedImage.1)
        }
        .fullScreenCover(isPresented: $cameraPresentation.2) {
            CameraView(isPresented: $cameraPresentation.2, selectedImage: $controller.selectedImage.2)
        }
    }
}

struct PitSubmit: View {
    @EnvironmentObject var controller: PitScoutingController
    @Environment(\.dismiss) var dismiss
    private var submissionStateDecoder: [String] = [
        "Preparing Data",
        "Uploading Image 1",
        "Uploading Image 2",
        "Uploading Image 3",
        "Assembling Data",
        "Uploading Data",
        "Done",
        "Error"
    ]
    
    var body: some View {
        VStack {
            if controller.submissionStatus < 6 {
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
                    Text(submissionStateDecoder[controller.submissionStatus])
                        .font(.title)
                    Spacer()
                }
                .onAppear {
                    Task {
                        await controller.submit()
                    }
                }
            } else if controller.submissionStatus == 6 {
                VStack {
                    Spacer()
                    Label("Done", systemImage: "checkmark.seal.fill")
                        .labelStyle(.iconOnly)
                        .font(.largeTitle)
                        .foregroundStyle(Color.green)
                        .padding()
                    Text("Done!")
                        .font(.title)
                    Button(action: {
                        dismiss()
                    }, label: {
                        Label("Close", systemImage: "xmark")
                            .labelStyle(.titleOnly)
                    }).padding().buttonStyle(.borderedProminent)
                    Spacer()
                }
                .onAppear {
                    controller.selectedTeam = 0
                    controller.booleans = (false, false, false, false, false, false, false, false)
                    controller.numericals = (0, 0, 0, 0, 0, 0, 0, 0)
                    controller.notes = ""
                    controller.selectedImage = (nil, nil, nil)
                    controller.imageData = (nil, nil, nil)
                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                }
            } else {
                VStack {
                    Spacer()
                    Label("Done", systemImage: "xmark.seal.fill")
                        .labelStyle(.iconOnly)
                        .font(.largeTitle)
                        .foregroundStyle(Color.red)
                        .padding()
                    Text("Fatal Error. Retry at will.")
                        .font(.title)
                        .padding()
                    Text(controller.submissionError)
                        .font(.title2)
                        .padding()
                    Spacer()
                }
                .onAppear {
                    UINotificationFeedbackGenerator().notificationOccurred(.error)
                }
            }
        }
    }
}


struct CameraView: UIViewControllerRepresentable {
    @Binding var isPresented: Bool
    @Binding var selectedImage: UIImage?
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        var parent: CameraView
        
        init(parent: CameraView) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.selectedImage = image
            }
            parent.isPresented = false
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.isPresented = false
        }
    }
    
    func makeCoordinator() -> Coordinator {
        return Coordinator(parent: self)
    }
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.allowsEditing = true
        picker.delegate = context.coordinator
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
}

#Preview {
    PitScouting()
}
