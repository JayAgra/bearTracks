//
//  PitDataController.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 2/5/25.
//

import Foundation

class PitDataController: ObservableObject {
    @Published public var teamNumber: Int
    @Published public var pitDataState: Int = 0 // 0 waiting 1 done 2 error
    @Published public var pitDataError: String?
    @Published public var pitData: [PitData] = []
    @Published public var mergedPitData: MergedPitData?
    
    init(teamNumber: Int) {
        self.teamNumber = teamNumber
    }
    
    func fetchPitData() {
        pitDataState = 0
        guard let url = URL(string: "https://beartracks.io/api/v1/data/pit/2025/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? "TEST")/\(String(teamNumber))") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode([PitData].self, from: data)
                    DispatchQueue.main.async {
                        self.mergedPitData = self.mergePitData(pitData: result)
                        (self.pitDataState, self.pitData) = (1, result)
                    }
                } catch {
                    print("parse error")
                    (self.pitDataState, self.pitData, self.pitDataError) = (2, [], "Parse error")
                    return
                }
            } else if let error = error {
                print("fetch error: \(error)")
                (self.pitDataState, self.pitData, self.pitDataError) = (2, [], "Fetch error\n\(error)")
                return
            }
        }
        requestTask.resume()
    }
    
    func mergePitData(pitData: [PitData]) -> MergedPitData {
        var mergedData = MergedPitData(id: [], algae_proc: [], algae_net: [], coral_1: [], coral_2: [], coral_3: [], coral_4: [], shallow: [], deep: [], drivetrain: [], swerve: [], favorite_piece: [], favorite_coral: [], favorite_cage: [], estimated_cycles: [], auto_algae: [], auto_coral: [], image_ids: [], notes: [], user_id: [], name: [], from_team: [])
        
        for pitData in pitData {
            let booleanValues = pitData.boolean_values.split(separator: ",").map { $0 == "true" }

            mergedData.algae_proc.append(contentsOf: Array(booleanValues.prefix(1)))
            mergedData.algae_net.append(contentsOf: Array(booleanValues.dropFirst().prefix(1)))
            mergedData.coral_1.append(contentsOf: Array(booleanValues.dropFirst(2).prefix(1)))
            mergedData.coral_2.append(contentsOf: Array(booleanValues.dropFirst(3).prefix(1)))
            mergedData.coral_3.append(contentsOf: Array(booleanValues.dropFirst(4).prefix(1)))
            mergedData.coral_4.append(contentsOf: Array(booleanValues.dropFirst(5).prefix(1)))
            mergedData.shallow.append(contentsOf: Array(booleanValues.dropFirst(6).prefix(1)))
            mergedData.deep.append(contentsOf: Array(booleanValues.dropFirst(7).prefix(1)))

            let numericalValues = pitData.numerical_values.split(separator: ",").compactMap { Int($0) }

            mergedData.drivetrain.append(contentsOf: Array(numericalValues.prefix(1)))
            mergedData.swerve.append(contentsOf: Array(numericalValues.dropFirst().prefix(1)))
            mergedData.favorite_piece.append(contentsOf: Array(numericalValues.dropFirst(2).prefix(1)))
            mergedData.favorite_coral.append(contentsOf: Array(numericalValues.dropFirst(3).prefix(1)))
            mergedData.favorite_cage.append(contentsOf: Array(numericalValues.dropFirst(4).prefix(1)))
            mergedData.estimated_cycles.append(contentsOf: Array(numericalValues.dropFirst(5).prefix(1)))
            mergedData.auto_algae.append(contentsOf: Array(numericalValues.dropFirst(6).prefix(1)))
            mergedData.auto_coral.append(contentsOf: Array(numericalValues.dropFirst(7).prefix(1)))

            let imageIds = pitData.image_ids.split(separator: ",").map { String($0) }
            mergedData.image_ids.append(contentsOf: imageIds)
        }

        return mergedData
    }
}

struct PitData: Codable {
    let id: Int
    let season: Int
    let event: String
    let team: Int
    let boolean_values: String
    let numerical_values: String
    let image_ids: String
    let description: String
    let user_id: Int
    let name: String
    let from_team: Int
}

struct MergedPitData {
    var id: [Int]
    var algae_proc: [Bool]
    var algae_net: [Bool]
    var coral_1: [Bool]
    var coral_2: [Bool]
    var coral_3: [Bool]
    var coral_4: [Bool]
    var shallow: [Bool]
    var deep: [Bool]
    var drivetrain: [Int]
    var swerve: [Int]
    var favorite_piece: [Int]
    var favorite_coral: [Int]
    var favorite_cage: [Int]
    var estimated_cycles: [Int]
    var auto_algae: [Int]
    var auto_coral: [Int]
    var image_ids: [String]
    var notes: [String]
    var user_id: [Int]
    var name: [String]
    var from_team: [Int]
}
