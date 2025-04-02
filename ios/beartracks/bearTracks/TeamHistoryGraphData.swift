//
//  TeamHistoryGraphData.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 4/1/25.
//

import Foundation
import Charts

@available(iOS 18.0, *)
class TeamHistoryGraphData: ObservableObject {
    private var teamNumber: Int
    @Published public var briefData: [DataEntry] = []
    
    init(teamNumber: Int) {
        self.teamNumber = teamNumber
    }
    
    func fetchDataJson() {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/brief/team/\(UserDefaults().string(forKey: "season") ?? "2025")/\(UserDefaults().string(forKey: "eventCode") ?? "TEST")/\(String(teamNumber))") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        
        let requestTask = sharedSession.dataTask(with: request) { (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode([DataEntry].self, from: data)
                    DispatchQueue.main.async {
                        DispatchQueue.main.async {
                            self.briefData = result
                        }
                    }
                } catch {
                    print("parse error")
                    DispatchQueue.main.async {
                        self.briefData = []
                    }
                }
            } else if let error = error {
                print("fetch error: \(error)")
                DispatchQueue.main.async {
                    self.briefData = []
                }
            }
        }
        requestTask.resume()
    }
    
    func getFullData(id: Int, completion: @escaping (FullMainData?) -> Void) {
        let urlString = "https://beartracks.io/api/v1/data/detail/\(id)"
        guard let url = URL(string: urlString) else { return }
        
        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                print("error fetching data: \(error)")
                completion(nil)
                return
            }
            guard let data = data else {completion(nil); return }
            do {
                let decoder = JSONDecoder()
                let fullMainData = try decoder.decode([DetailedData].self, from: data)
                completion(fullMainData.first?.FullMain ?? nil)
            } catch {
                print("error decoding data: \(error)")
                completion(nil)
            }
        }
        task.resume()
    }
    
    func processData(briefDataList: [DataEntry], completion: @escaping ([Int: [Double]]) -> Void) {
        var matchData = [Int: [Double]]()
        var matchCount = [Int: Int]()
        
        let dispatchGroup = DispatchGroup()
        
        for briefData in briefDataList {
            dispatchGroup.enter()
            getFullData(id: briefData.Brief.id) { fullMainData in
                guard let fullMainData = fullMainData else { dispatchGroup.leave(); return }
                let analysisValues = fullMainData.analysis.split(separator: ",").compactMap { Int($0) }
                if matchData[fullMainData.match_num] == nil {
                    matchData[fullMainData.match_num] = Array(repeating: 0.0, count: analysisValues.count)
                    matchCount[fullMainData.match_num] = 0
                }
                for (index, value) in analysisValues.enumerated() {
                    matchData[fullMainData.match_num]?[index] += Double(value)
                }
                matchCount[fullMainData.match_num]! += 1
                dispatchGroup.leave()
            }
        }
        
        dispatchGroup.notify(queue: .main) {
            for (matchNum, data) in matchData {
                let count = matchCount[matchNum]!
                let averages = data.map { $0 / Double(count) }
                matchData[matchNum] = averages
            }
            completion(matchData)
        }
    }
}
