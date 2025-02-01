//
//  LoginView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI
import AuthenticationServices

struct LoginView: View {
    @State private var showAlert = false
    @State private var authData: [String] = ["", "", "", ""]
    @State private var alertMessage = ""
    @State private var loading = false
    @State private var create = false
    @EnvironmentObject var controller: ScoutingController
    
    var body: some View {
        VStack {
            Text("bearTracks")
                .font(.title)
            Text("v\(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "5") • 2025")
            if !loading {
                if !create {
                    Text("Log In")
                        .font(.title3)
                        .padding(.top)
                    HStack {
                        TextField("Username", text: $authData[0])
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .autocorrectionDisabled(true)
                            .textInputAutocapitalization(.never)
                            .textContentType(.username)
                        if #available(iOS 16.0, *) {
                            Button("Use Passkey") {
                                authenticateWithPasskey(username: authData[0]) { result in
                                    switch result {
                                    case .success(let credential):
                                        sendAuthFinishRequest(credential: credential) { result in
                                            switch result {
                                            case .success(let data):
                                                print("Auth finish response: \(String(data: data, encoding: .utf8) ?? "")")
                                            case .failure(let error):
                                                print("Failed to send auth finish request: \(error.localizedDescription)")
                                                UINotificationFeedbackGenerator().notificationOccurred(.error)
                                            }
                                        }
                                    case .failure(let error):
                                        print("Passkey authentication failed: \(error.localizedDescription)")
                                        UINotificationFeedbackGenerator().notificationOccurred(.error)
                                    }
                                }
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                    .padding(.horizontal)
                    HStack {
                        SecureField("Password", text: $authData[1])
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .autocorrectionDisabled(true)
                            .textInputAutocapitalization(.never)
                            .textContentType(.password)
                        Button("Log In           ") {
                            authAction(type: "login", data: ["username": authData[0], "password": authData[1]])
                        }
                        .buttonStyle(.bordered)
                    }.padding([.horizontal, .bottom])
                    Button("Create Account") {
                        self.create = true
                    }
                } else {
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
                    Button("Create Account") {
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
                            if type == "login" {
                                controller.loginRequired = 1
                            } else {
                                create = false
                            }
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
                    alertMessage = "Network error. Please ensure you are connected to the internet and try again."
                }
            }.resume()
        } catch {
            loading = false
            showAlert = true
            alertMessage = "Client error- failed to serialize authentication object. Please try agian."
        }
    }
}

extension LoginView {
    private func fetchAuthStartChallenge(username: String, completion: @escaping (Data?, Error?) -> Void) {
        let urlString = "https://beartracks.io/api/v1/auth/passkey/auth_start/\(username)"
        guard let url = URL(string: urlString) else {
            completion(nil, NSError(domain: "Invalid URL", code: -1, userInfo: nil))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                completion(data, error)
            }
        }
        task.resume()
    }
}

func authenticateWithPasskey(username: String, completion: @escaping (Result<ASAuthorizationPlatformPublicKeyCredentialAssertion, Error>) -> Void) {
    fetchAuthStartChallenge(username: username) { result in
        switch result {
        case .success(let authStartResponse):
            initiatePasskeyAuthentication(authStartResponse: authStartResponse, completion: completion)
        case .failure(let error):
            completion(.failure(error))
        }
    }
}

private func fetchAuthStartChallenge(username: String, completion: @escaping (Result<AuthStartResponse, Error>) -> Void) {
    let urlString = "https://beartracks.io/api/v1/auth/passkey/auth_start/\(username)"
    guard let url = URL(string: urlString) else {
        completion(.failure(NSError(domain: "Invalid URL", code: -1, userInfo: nil)))
        return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"

    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            completion(.failure(error))
            return
        }
        guard let data = data else {
            completion(.failure(NSError(domain: "No data received", code: -1, userInfo: nil)))
            return
        }
        do {
            let authStartResponse = try JSONDecoder().decode(AuthStartResponse.self, from: data)
            completion(.success(authStartResponse))
        } catch {
            completion(.failure(error))
        }
    }
    task.resume()
}

private var authControllerDelegate: AuthControllerDelegate?

private func initiatePasskeyAuthentication(authStartResponse: AuthStartResponse, completion: @escaping (Result<ASAuthorizationPlatformPublicKeyCredentialAssertion, Error>) -> Void) {
    if #available(iOS 16.0, *) {
        print("RP ID: \(authStartResponse.publicKey.rpId)")
        print("Challenge: \(authStartResponse.publicKey.challenge)")

        func base64URLToBase64(_ base64URL: String) -> String {
            var base64 = base64URL
                .replacingOccurrences(of: "-", with: "+")
                .replacingOccurrences(of: "_", with: "/")
            while base64.count % 4 != 0 {
                base64 += "="
            }
            return base64
        }

        let base64Challenge = base64URLToBase64(authStartResponse.publicKey.challenge)
        guard let challenge = Data(base64Encoded: base64Challenge) else {
            completion(.failure(NSError(domain: "Invalid challenge", code: -1, userInfo: nil)))
            return
        }

        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: authStartResponse.publicKey.rpId)

        let allowedCredentials = authStartResponse.publicKey.allowCredentials?.map { credential in
            ASAuthorizationPlatformPublicKeyCredentialDescriptor(
                credentialID: Data(base64Encoded: credential.id) ?? Data()
            )
        }

        let authRequest = provider.createCredentialAssertionRequest(challenge: challenge)
        authRequest.allowedCredentials = allowedCredentials ?? []

        print("Allowed Credentials: \(authRequest.allowedCredentials)")
        
        authControllerDelegate = AuthControllerDelegate(completion: completion)

        let authController = ASAuthorizationController(authorizationRequests: [authRequest])
        authController.delegate = authControllerDelegate
        authController.performRequests()
    } else {
        completion(.failure(NSError(domain: "Passkeys require iOS 16 or later", code: -1, userInfo: nil)))
    }
}

struct AuthStartResponse: Codable {
    let publicKey: PublicKey

    struct PublicKey: Codable {
        let challenge: String
        let rpId: String
        let allowCredentials: [AllowCredential]?
        let timeout: Int?
        let userVerification: String?

        struct AllowCredential: Codable {
            let type: String
            let id: String
        }
    }
}

private class AuthControllerDelegate: NSObject, ASAuthorizationControllerDelegate {
    let completion: (Result<ASAuthorizationPlatformPublicKeyCredentialAssertion, Error>) -> Void

    init(completion: @escaping (Result<ASAuthorizationPlatformPublicKeyCredentialAssertion, Error>) -> Void) {
        self.completion = completion
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion {
            completion(.success(credential))
        }
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        completion(.failure(error))
    }
}

func sendAuthFinishRequest(credential: ASAuthorizationPlatformPublicKeyCredentialAssertion, completion: @escaping (Result<Data, Error>) -> Void) {
    let urlString = "https://your-server.com/api/v1/auth/passkey/auth_finish"
    guard let url = URL(string: urlString) else {
        completion(.failure(NSError(domain: "Invalid URL", code: -1, userInfo: nil)))
        return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let body: [String: Any] = [
        //"publicKey": [
            "id": credential.credentialID.base64EncodedString(),
            "rawId": credential.credentialID.base64EncodedString(),
            "response": [
                "authenticatorData": credential.rawAuthenticatorData.base64EncodedString(),
                "clientDataJSON": credential.rawClientDataJSON.base64EncodedString(),
                "signature": credential.signature.base64EncodedString(),
                "userHandle": credential.userID.base64EncodedString()
            ],
            "extensions": [:] as [String: Any],
            "type": "public-key"
        //]
    ]

    do {
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
    } catch {
        completion(.failure(error))
        return
    }

    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            completion(.failure(error))
            return
        }
        guard let data = data else {
            completion(.failure(NSError(domain: "No data received", code: -1, userInfo: nil)))
            return
        }
        completion(.success(data))
    }
    task.resume()
}

#Preview {
    LoginView()
}
