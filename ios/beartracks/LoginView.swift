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
    @State private var username = ""
    @State private var password = ""
    @State private var alertMessage = ""
    @State private var loading = false
    @State public var loginController: LoginStateController
    
    var body: some View {
        VStack {
            Text("bearTracks")
                .font(.title)
            Text("v5.0.2 • 2024")
            if !loading {
                TextField("username", text: $username)
                    .padding()
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .autocorrectionDisabled(true)
                    .textInputAutocapitalization(.never)
                    .textContentType(.username)
                SecureField("password", text: $password)
                    .padding()
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .autocorrectionDisabled(true)
                    .textInputAutocapitalization(.never)
                    .textContentType(.password)
                Button("login") {
                    login()
                }
                .padding()
                .font(.title3)
                .buttonStyle(.bordered)
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
    
    private func login() {
        loading = true
        guard let url = URL(string: "https://beartracks.io/api/v1/auth/login") else {
            return
        }

        let credentials = ["username": username, "password": password]

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: credentials)
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonData
            request.httpShouldHandleCookies = true

            sharedSession.dataTask(with: request) { data, response, error in
                if data != nil {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 200 {
                            loginController.loginRequired = false
                            loading = false
                        } else {
                            loading = false
                            showAlert = true
                            alertMessage = "bad credentials"
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
    LoginView(loginController: LoginStateController())
}
