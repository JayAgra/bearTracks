//
//  LoginView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct LoginView: View {
    @State private var showAlert = false
    @State private var username = ""
    @State private var password = ""
    @State private var alertMessage = ""
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        VStack {
            Text("bearTracks")
                .font(.title)
            Text("v5.0.0 • 2024")
            TextField("Username", text: $username)
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())
            SecureField("Password", text: $password)
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())
            Button("Login") {
                login()
            }
                .padding()
                .font(.title3)
                .buttonStyle(.bordered)
        }
        .padding()
        .alert(isPresented: $showAlert, content: {
            Alert (
                title: Text("Auth Error"),
                message: Text(alertMessage),
                dismissButton: .default(Text("ok"))
            )
        })
    }
    
    private func login() {
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

            sharedSession.dataTask(with: request) { _data, response, error in
                if let _data = _data {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 200 {
                            dismiss()
                        } else {
                            showAlert = true
                            alertMessage = "bad credentials"
                        }
                    }
                } else {
                    showAlert = true
                    alertMessage = "network error"
                }
            }.resume()
        } catch {
            showAlert = true
            alertMessage = "failed to serialize auth object"
        }
    }
}

#Preview {
    LoginView()
}
