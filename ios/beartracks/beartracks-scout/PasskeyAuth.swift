//
//  PasskeyAuth.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/31/25.
//

//import Foundation
//
//struct AuthStartResponse: Codable {
//    let challenge: String
//    let user: String
//    let rp: String
//}
//
//func parseAuthStartResponse(data: Data) -> AuthStartResponse? {
//    let decoder = JSONDecoder()
//    return try? decoder.decode(AuthStartResponse.self, from: data)
//}
//
//func fetchAuthStartChallenge(username: String, completion: @escaping (Data?, Error?) -> Void) {
//    let urlString = "https://beartracks.io/api/v1/auth/passkey/auth_start/\(username)"
//    guard let url = URL(string: urlString) else {
//        completion(nil, NSError(domain: "Invalid URL", code: -1, userInfo: nil))
//        return
//    }
//
//    var request = URLRequest(url: url)
//    request.httpMethod = "GET"
//
//    let task = URLSession.shared.dataTask(with: request) { data, response, error in
//        if let error = error {
//            completion(nil, error)
//            return
//        }
//        guard let data = data else {
//            completion(nil, NSError(domain: "No data received", code: -1, userInfo: nil))
//            return
//        }
//        completion(data, nil)
//    }
//    task.resume()
//}



