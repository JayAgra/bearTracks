//
//  LoginView.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 1/13/24.
//

import SwiftUI

struct LoginView: View {
    @State private var showAlert = false
    @State private var authData: [String] = ["", "", "", ""]
    @State private var alertMessage = ""
    @State private var loading = false
    @State private var create = false
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        VStack {
#if !os(watchOS)
            Text("bearTracks")
                .font(.title)
            Text("v\(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "5") • 2024")
#endif
            if !loading {
                if !create {
#if !os(watchOS)
                    Text("Log In")
                        .font(.title3)
                        .padding(.top)
#endif
                    TextField("Username", text: $authData[0])
#if !os(watchOS) && !os(tvOS)
                        .padding([.leading, .trailing, .bottom])
                        .textFieldStyle(RoundedBorderTextFieldStyle())
#endif
                        .autocorrectionDisabled(true)
                        .textInputAutocapitalization(.never)
                        .textContentType(.username)
                    SecureField("Password", text: $authData[1])
#if !os(watchOS) && !os(tvOS)
                        .padding()
                        .textFieldStyle(RoundedBorderTextFieldStyle())
#endif
                        .autocorrectionDisabled(true)
                        .textInputAutocapitalization(.never)
                        .textContentType(.password)
                    Button("Log In") {
                        authAction(type: "login", data: ["username": authData[0], "password": authData[1]])
                    }
#if !os(watchOS)
                    .padding()
#endif
                    .font(.title3)
                    .buttonStyle(.bordered)
#if !os(watchOS)
                    Button("Create") {
                        self.create = true
                    }
#endif
                } else {
#if !os(watchOS) && !os(tvOS)
                    Text("Create Account")
                        .font(.title3)
                        .padding(.top)
                    TextField("Team code", text: $authData[3])
                        .padding([.leading, .trailing])
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.numberPad)
                        .onChange(of: authData[3]) { _ in
                            authData[3] = String(authData[3].prefix(5))
                        }
                    TextField("Full name", text: $authData[2])
                        .padding([.leading, .trailing])
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .textContentType(.name)
                    TextField("Username", text: $authData[0])
                        .padding([.leading, .trailing])
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocorrectionDisabled(true)
                        .textInputAutocapitalization(.never)
                        .textContentType(.username)
                    SecureField("Password", text: $authData[1])
                        .padding([.leading, .trailing])
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocorrectionDisabled(true)
                        .textInputAutocapitalization(.never)
                        .textContentType(.newPassword)
                    Button("Create") {
                        authAction(
                            type: "create",
                            data: [
                                "access": authData[3], "full_name": authData[2], "username": authData[0],
                                "password": authData[1],
                            ])
                    }
                    .padding()
                    .font(.title3)
                    .buttonStyle(.bordered)
                    Button("Log In") {
                        self.create = false
                    }
#endif
                }
            } else {
                Spacer()
                ProgressView()
#if !os(tvOS)
                    .controlSize(.large)
#endif
                    .padding()
                Spacer()
            }
        }
        .padding()
        .alert(
            isPresented: $showAlert,
            content: {
                Alert(
                    title: Text("Authentication Error"),
                    message: Text(alertMessage),
                    dismissButton: .default(Text("OK"))
                )
            })
    }
    
    private func authAction(type: String, data: [String: String]) {
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
                                alertMessage = "Bad Credentials"
                            } else {
                                if httpResponse.statusCode == 400 {
                                    alertMessage =
                                    "You supplied some data the server did not like. Your account was **not** created. Please try agian following these conditions- your Username, Full name, and Password must contain only the following characters: a-z 0-9 A-Z - ~ ! @ # $ % ^ & * ( ) = + / \\ _ { } | ? . ,"
                                } else if httpResponse.statusCode == 409 {
                                    alertMessage = "Username taken. Your account was **not** created. Please try again with a new username."
                                } else if httpResponse.statusCode == 403 {
                                    alertMessage = "Invalid access key. Ask your team lead or the application developers for another one. If your team failed to provide any data at a competition, your team's access key may have been indefinitely revoked. Your account was **not** created."
                                } else if httpResponse.statusCode == 413 {
                                    alertMessage =
                                    "Field lengths- your Username, Full name, and Password must be between 3 and 64 characters (8 min for password). Your account was **not** created. Please try agian, abiding by these requirements."
                                } else {
                                    alertMessage = "Account creation failed. Your account was **not** created. Please try again (unexpected error)."
                                }
                            }
                        }
                    }
                } else {
                    loading = false
                    showAlert = true
                    alertMessage = "Network Error"
                }
            }.resume()
        } catch {
            loading = false
            showAlert = true
            alertMessage = "Fatal Client Error: Failed to serialize authentication object"
        }
    }
}

#Preview {
    LoginView()
}
