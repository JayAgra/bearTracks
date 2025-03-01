//
//  PitScoutingController.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 2/4/25.
//

import Foundation
import UIKit

public struct PitScoutingAllTeams {
    let status: Int
    let teams: [PitScoutingBasicTeam]
}

public struct PitScoutingBasicTeam {
    let number: Int
    let nameShort: String
}

public struct OutgoingImage: Codable {
    let data: String
}

public struct ImageId: Codable {
    let id: String
}

public struct PitFormUpload: Codable {
    let season: Int
    let event: String
    let team: Int
    let boolean_values, numerical_values, image_ids, description: String
}

class PitScoutingController: ObservableObject {
    // tab selection
    @Published public var state: PitScoutingState = .teamSelection
    @Published public var allTeams: PitScoutingAllTeams = PitScoutingAllTeams(status: 0, teams: [])
    @Published public var scoutedTeams: (Int, [Int]) = (0, []) // first indicates status. 0 = waiting, 1 = done, 2 = error
    @Published public var selectedTeam: Int = 0
    // can score algae processor, algae net, coral 1, 2, 3, 4, shallow cage, deep cage
    @Published public var booleans: (Bool, Bool, Bool, Bool, Bool, Bool, Bool, Bool) = (false, false, false, false, false, false, false, false)
    // drivetrain (swerve 0, west coast 1, mecanum 2, omni 3, other 4), swerve modules (not swerve 0, sds 1, andymark 2, rev 3, westcoast 4, other 5), favorite game piece (0 algae, 1 coral), favorite coral location (0 n/a, 1=1, 2=2, 3=3, 4=4), favorite cage (n/a 0, shallow 1, deep 2), estimated cycles per game, auto algae, auto coral
    @Published public var numericals: (Int, Int, Int, Int, Int, Int, Int, Int) = (0, 0, 0, 0, 0, 0, 0, 0)
    @Published public var notes: String = ""
    @Published public var selectedImage: (UIImage?, UIImage?, UIImage?) = (nil, nil, nil)
    @Published public var imageData: (String?, String?, String?) = (nil, nil, nil)
    // 0 preparing, 1 uploading image 1, 2 uploading image 2, 3 uploading image 3, 4 assembling data, 5 uploading data, 6 done, 7 err
    @Published public var submissionStatus: Int = 0
    @Published public var submissionError: String = ""
    
    func submit() async {
        var imageUrls: [String] = []
        // image 1
        DispatchQueue.main.sync {
            self.submissionStatus = 1
        }
        if let image0Data = imageData.0 {
            do {
                let image1id = try await uploadImage(imageData: "data:image/jpg;base64," + image0Data)
                if image1id.id.hasPrefix("$ERROR$") { self.submissionError = String(image1id.id.split(separator: "$").last ?? String.SubSequence("Unknown Image Upload Error")); self.submissionStatus = 7; return }
                imageUrls.append(image1id.id)
            } catch {
                self.submissionError = String("\(error)")
                self.submissionStatus = 7
                return
            }
        }
        // image 2
        DispatchQueue.main.sync {
            self.submissionStatus = 2
        }
        if let image1Data = imageData.1 {
            do {
                let image2id = try await uploadImage(imageData: "data:image/jpg;base64," + image1Data)
                if image2id.id.hasPrefix("$ERROR$") { self.submissionError = String(image2id.id.split(separator: "$").last ?? String.SubSequence("Unknown Image Upload Error")); self.submissionStatus = 7; return }
                imageUrls.append(image2id.id)
            } catch {
                self.submissionError = String("\(error)")
                self.submissionStatus = 7
                return
            }
        }
        // image 3
        DispatchQueue.main.sync {
            self.submissionStatus = 3
        }
        if let image2Data = imageData.2 {
            do {
                let image3id = try await uploadImage(imageData: "data:image/jpg;base64," + image2Data)
                if image3id.id.hasPrefix("$ERROR$") { self.submissionError = String(image3id.id.split(separator: "$").last ?? String.SubSequence("Unknown Image Upload Error")); self.submissionStatus = 7; return }
                imageUrls.append(image3id.id)
            } catch {
                self.submissionError = String("\(error)")
                self.submissionStatus = 7
                return
            }
        }
        // all images done
        DispatchQueue.main.sync {
            self.submissionStatus = 4
        }
        let imageUrlSingle = imageUrls.joined(separator: ",")
        // upload data
        guard let url = URL(string: "https://beartracks.io/api/v1/data/submit_pit") else { return }
        
        let boolean_values = [self.booleans.0, self.booleans.1, self.booleans.2, self.booleans.3, self.booleans.4, self.booleans.5, self.booleans.6, self.booleans.7].map { "\($0)" }.joined(separator: ",")
        let numerical_values = [self.numericals.0, self.numericals.1, self.numericals.2, self.numericals.3, self.numericals.4, self.numericals.5, self.numericals.6, self.numericals.7].map { "\($0)" }.joined(separator: ",")
        
        let pitForm = PitFormUpload(season: 2025, event: UserDefaults.standard.string(forKey: "eventCode") ?? "TEST", team: self.selectedTeam, boolean_values: boolean_values, numerical_values: numerical_values, image_ids: imageUrlSingle, description: self.notes);
        
        do {
            let jsonData = try JSONEncoder().encode(pitForm)
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonData
            request.httpShouldHandleCookies = true
            let requestTask = sharedSession.dataTask(with: request) {
                (data: Data?, response: URLResponse?, error: Error?) in
                if data != nil {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 200 {
                            DispatchQueue.main.sync {
                                self.submissionStatus = 6
                            }
                        } else {
                            DispatchQueue.main.sync {
                                self.submissionStatus = 7
                                self.submissionError = "Response code \(httpResponse.statusCode)"
                            }
                        }
                    } else {
                        DispatchQueue.main.sync {
                            self.submissionStatus = 7
                            self.submissionError = "Client response handling error"
                        }
                    }
                } else {
                    DispatchQueue.main.sync {
                        self.submissionStatus = 7
                        self.submissionError = "Nil server response.\nCheck your network."
                    }
                }
            }
            requestTask.resume()
        } catch {
            DispatchQueue.main.sync {
                self.submissionStatus = 7
                self.submissionError = "Client data encoding failure"
            }
        }
    }

    func uploadImage(imageData: String) async throws -> ImageId {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/upload_image") else { throw URLError(.badURL) }
        
        let outgoingImage = OutgoingImage(data: imageData)
        let jsonData: Data
        do {
            jsonData = try JSONEncoder().encode(outgoingImage)
        } catch {
            throw error
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData
        request.httpShouldHandleCookies = true
        
        return try await withCheckedThrowingContinuation { continuation in
            sharedSession.dataTask(with: request) { data, _, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                
                guard let data = data else {
                    continuation.resume(throwing: URLError(.badServerResponse))
                    return
                }
                
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(ImageId.self, from: data)
                    continuation.resume(returning: result)
                } catch {
                    print("HTTP Response: \(String(describing: data))")
                    continuation.resume(throwing: URLError(.cannotParseResponse))
                }
            }.resume()
        }
    }

    
    func getScoutedTeams() {
        self.scoutedTeams = (0, [])
        guard let url = URL(string:"https://beartracks.io/api/v1/data/pit_scouted/\(UserDefaults.standard.string(forKey: "season") ?? "2025")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "TEST")")
        else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode([Int].self, from: data)
                    DispatchQueue.main.async {
                        self.scoutedTeams = (1, result)
                    }
                } catch {
                    print(error)
                    DispatchQueue.main.sync {
                        self.scoutedTeams = (2, [])
                    }
                }
            } else {
                DispatchQueue.main.sync {
                    self.scoutedTeams = (2, [])
                }
            }
        }
        requestTask.resume()
    }
    
    func getAllTeams() {
        self.allTeams = PitScoutingAllTeams(status: 0, teams: [])
        guard let url = URL(string:"https://beartracks.io/api/v1/events/teams/\(UserDefaults.standard.string(forKey: "season") ?? "2025")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "TEST")")
        else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(TeamList.self, from: data)
                    DispatchQueue.main.async {
                        self.allTeams = PitScoutingAllTeams(status: 1, teams: result.teams.map{ PitScoutingBasicTeam(number: $0.teamNumber, nameShort: $0.nameShort) })
                    }
                } catch {
                    print(error)
                    DispatchQueue.main.sync {
                        self.allTeams = PitScoutingAllTeams(status: 2, teams: [])
                    }
                }
            } else {
                DispatchQueue.main.sync {
                    self.allTeams = PitScoutingAllTeams(status: 2, teams: [])
                }
            }
        }
        requestTask.resume()
    }
}

struct TeamList: Codable {
    let teamCountTotal, teamCountPage: Int
    let pageCurrent, pageTotal: Int
    let teams: [TeamListTeamEntry]
}

struct TeamListTeamEntry: Codable {
    let teamNumber: Int
    let nameFull, nameShort: String
    let city, stateProv, country: String
    let rookieYear: Int
    let robotName, schoolName, website: String
    let homeCMP: String?
}

