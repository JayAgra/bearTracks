//
//  LoginView.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 1/13/24.
//

import SwiftUI

/// Login sheet view
struct LoginView: View {
    @State private var showAlert = false
    @State private var authData: [String] = ["", "", "", ""]
    @State private var alertMessage = ""
    @State private var loading = false
    @State private var create = false
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        VStack {
            Text("bearTracks")
                .font(.title)
            Text("v5.0.4 • 2024")
            if !loading {
                if !create {
                    Text("log in")
                        .font(.title3)
                        .padding(.top)
                    TextField("username", text: $authData[0])
                        .padding([.leading, .trailing, .bottom])
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocorrectionDisabled(true)
                        .textInputAutocapitalization(.never)
                        .textContentType(.username)
                    SecureField("password", text: $authData[1])
                        .padding()
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocorrectionDisabled(true)
                        .textInputAutocapitalization(.never)
                        .textContentType(.password)
                    Button("login") {
                        authAction(type: "login", data: ["username": authData[0], "password": authData[1]])
                    }
                    .padding()
                    .font(.title3)
                    .buttonStyle(.bordered)
                    Button("create") {
                        self.create = true
                    }
                } else {
                    Text("create account")
                        .font(.title3)
                        .padding(.top)
                    TextField("team code", text: $authData[3])
                        .padding([.leading, .trailing])
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.numberPad)
                        .onChange(of: authData[3]) { _ in
                            authData[3] = String(authData[3].prefix(5))
                        }
                    TextField("full name", text: $authData[2])
                        .padding([.leading, .trailing])
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .textContentType(.name)
                    TextField("username", text: $authData[0])
                        .padding([.leading, .trailing])
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocorrectionDisabled(true)
                        .textInputAutocapitalization(.never)
                        .textContentType(.username)
                    SecureField("password", text: $authData[1])
                        .padding([.leading, .trailing])
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocorrectionDisabled(true)
                        .textInputAutocapitalization(.never)
                        .textContentType(.newPassword)
                    Button("create") {
                        authAction(type: "create", data: ["access": authData[3], "full_name": authData[2], "username": authData[0], "password": authData[1]])
                    }
                    .padding()
                    .font(.title3)
                    .buttonStyle(.bordered)
                    Button("login") {
                        self.create = false
                    }
                }
            } else {
                Spacer()
                ProgressView()
                    .controlSize(.large)
                    .padding()
                Spacer()
            }
        }
        .padding()
        .alert(isPresented: $showAlert, content: {
            Alert(
                title: Text("Auth Error"),
                message: Text(alertMessage),
                dismissButton: .default(Text("ok"))
            )
        })
    }
    
    private func authAction(type: String, data: Dictionary<String, String>) {
        loading = true
        guard let url = URL(string: "https://beartracks.io/api/v1/auth/\(type)") else { return }
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: data)
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonData
            request.httpShouldHandleCookies = true
            sharedSession.dataTask(with: request) { data, response, error in
                if data != nil {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 200 {
                            appState.loginRequired = false
                            loading = false
                        } else {
                            loading = false
                            showAlert = true
                            if type == "login" {
                                alertMessage = "bad credentials"
                            } else {
                                if httpResponse.statusCode == 400 {
                                    alertMessage = "you supplied some data the server didn't like very much. your username could have been taken or your team code was invalid. alternatively, either your username, full name, or password was not between 3 and 32 characters (8 min for password) or they contained special characters other than \"-\" or \"_\"."
                                } else {
                                    alertMessage = "creation failed"
                                }
                            }
                        }
                    }
                } else {
                    loading = false
                    showAlert = true
                    alertMessage = "network error"
                }
            }.resume()
        } catch {
            loading = false
            showAlert = true
            alertMessage = "failed to serialize auth object"
        }
    }
}

#Preview {
    LoginView()
}
