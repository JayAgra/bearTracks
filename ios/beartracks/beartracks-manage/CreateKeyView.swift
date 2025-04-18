//
//  CreateKeyView.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/16/24.
//

import SwiftUI

struct CreateKeyView: View {
    @State private var teamNumber: String = ""
    @State private var teamKey: String = ""
    @State private var requestStatus: (Bool, Bool, Bool) = (false, false, false)
    
    var body: some View {
        VStack {
            NavigationStack {
                if !requestStatus.0 {
                    if !requestStatus.1 {
                        VStack {
                            TextField("Team", text: $teamNumber)
                                .keyboardType(.numberPad)
                                .textFieldStyle(.roundedBorder)
                                .onChange(of: teamNumber) {
                                    teamNumber = String(teamNumber.prefix(5))
                                }
                            TextField("Key", text: $teamKey)
                                .keyboardType(.numberPad)
                                .textFieldStyle(.roundedBorder)
                                .onChange(of: teamKey) {
                                    teamKey = String(teamKey.prefix(5))
                                }
                            Button("Create") {
                                requestStatus.0 = true
                                createTeamKey()
                            }
                            .buttonStyle(.bordered)
                            .padding()
                        }
                        .padding()
                        .navigationTitle("Create Key")
                    } else {
                        if requestStatus.2 {
                            VStack {
                                Spacer()
                                Label("Error", systemImage: "xmark.seal.fill")
                                    .labelStyle(.iconOnly)
                                    .font(.largeTitle)
                                    .foregroundStyle(Color.red)
                                    .padding()
                                Text("Error")
                                    .font(.title)
                                Spacer()
                            }
                        } else {
                            VStack {
                                Spacer()
                                Label("Done", systemImage: "checkmark.seal.fill")
                                    .labelStyle(.iconOnly)
                                    .font(.largeTitle)
                                    .foregroundStyle(Color.green)
                                    .padding()
                                Text("Done")
                                    .font(.title)
                                Spacer()
                            }
                        }
                    }
                } else {
                    VStack {
                        Spacer()
                        ProgressView()
                            .controlSize(.large)
                            .padding()
                        Text("Creating...")
                            .font(.title)
                        Spacer()
                    }
                }
            }
        }
    }
    
    func createTeamKey() {
        guard
            let url = URL(
                string: "https://beartracks.io/api/v1/manage/access_key/create/\(teamKey)/\(teamNumber)")
        else {
            return
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpShouldHandleCookies = true
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                if let httpResponse = response as? HTTPURLResponse {
                    if httpResponse.statusCode == 200 {
                        self.requestStatus = (false, true, false)
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                    } else {
                        self.requestStatus = (false, true, true)
                        UINotificationFeedbackGenerator().notificationOccurred(.error)
                    }
                }
            } else if let error = error {
                print("Fetch error: \(error)")
                self.requestStatus = (false, true, true)
                UINotificationFeedbackGenerator().notificationOccurred(.error)
            }
        }
        requestTask.resume()
    }
}

#Preview {
    CreateKeyView()
}
