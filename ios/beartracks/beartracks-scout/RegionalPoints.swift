//
//  RegionalPoints.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 1/30/25.
//

import SwiftUI

struct RegionalPoints: View {
    @State private var totalTeams: Int = 60
    @State private var teamRank: Int = 30
    @State private var allianceCaptain: Int = 0 // 17 for no capt
    @State private var draftOrderAcceptance: Int = 0 // 17 for no acceptance
    @State private var allianceFinish: Int = 0 // 0 for no place. 7 for 4th, 13 for 3rd, 20 for 2nd and 1st
    @State private var allianceMatchesWon: Int = 0
    @State private var allianceWinningMatchesPlayed: Int = 0
    @State private var awardsWon: Int = 0 // 0 none, 1 other, 2 rookie, 3 eng insp, 4 impact
    @State private var teamAge: Int = 0 // 0 no bonus, 1 2024, 2 2025
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    Stepper {
                        Text("Total Teams (\(totalTeams))")
                    } onIncrement: {
                        totalTeams += 1
                    } onDecrement: {
                        if totalTeams > 1 {
                            totalTeams -= 1
                        } else {
                            // UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                    Stepper {
                        Text("Team Rank (\(teamRank))")
                    } onIncrement: {
                        if teamRank < totalTeams {
                            teamRank += 1
                        } else {
                            // UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    } onDecrement: {
                        if teamRank > 1 {
                            teamRank -= 1
                        } else {
                            // UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                }
                Section {
                    Stepper {
                        Text("Alliance Capt, 0 for N/A (\(allianceCaptain))")
                    } onIncrement: {
                        if allianceCaptain < 8 {
                            allianceCaptain += 1
                        } else {
                            // UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    } onDecrement: {
                        if allianceCaptain > 0 {
                            allianceCaptain -= 1
                        } else {
                            // UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                    Stepper {
                        Text("Draft Order, 0 for N/A (\(draftOrderAcceptance))")
                    } onIncrement: {
                        if draftOrderAcceptance < 17 {
                            draftOrderAcceptance += 1
                        } else {
                            // UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    } onDecrement: {
                        if draftOrderAcceptance > 0 {
                            draftOrderAcceptance -= 1
                        } else {
                            // UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                }
                Section {
                    Picker("Place", selection: $allianceFinish) {
                        Text("5th or below").tag(0)
                        Text("4th").tag(7)
                        Text("3rd").tag(13)
                        Text("1st or 2nd").tag(20)
                    }
                    .pickerStyle(.menu)
                    Stepper {
                        Text("Alliance Matches Won (\(allianceMatchesWon))")
                    } onIncrement: {
                        allianceMatchesWon += 1
                    } onDecrement: {
                        if allianceMatchesWon > 0 {
                            allianceMatchesWon -= 1
                        } else {
                            // UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                    Stepper {
                        Text("Winning Matches Played (\(allianceWinningMatchesPlayed))")
                    } onIncrement: {
                        if allianceWinningMatchesPlayed < allianceMatchesWon {
                            allianceWinningMatchesPlayed += 1
                        } else {
                            // UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    } onDecrement: {
                        if allianceWinningMatchesPlayed > 0 {
                            allianceWinningMatchesPlayed -= 1
                        } else {
                            // UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                }
                Section {
                    Picker("Awards", selection: $awardsWon) {
                        Text("None").tag(0)
                        Text("Other Awards").tag(1)
                        Text("Rookie All-Star").tag(2)
                        Text("Engineering Inspiration").tag(3)
                        Text("Impact").tag(4)
                    }
                    .pickerStyle(.menu)
                    Picker("Rookie Bonus", selection: $teamAge) {
                        Text("2023 or earlier").tag(0)
                        Text("2024").tag(1)
                        Text("2025").tag(2)
                    }
                    .pickerStyle(.menu)
                }
                Section {
                    Text(String(calculateRegionalPoints(totalTeams: totalTeams, teamRank: teamRank, allianceCaptain: allianceCaptain, draftOrderAcceptance: draftOrderAcceptance, allianceFinish: allianceFinish, allianceMatchesWon: allianceMatchesWon, allianceWinningMatchesPlayed: allianceWinningMatchesPlayed, awardsWon: awardsWon, teamAge: teamAge)))
                }
            }.navigationTitle("Regional Points")
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

func calculateRegionalPoints(totalTeams: Int, teamRank: Int, allianceCaptain: Int, draftOrderAcceptance: Int, allianceFinish: Int, allianceMatchesWon: Int, allianceWinningMatchesPlayed: Int, awardsWon: Int, teamAge: Int) -> Double {
    return qualificationPoints(finalRankR: teamRank, totalTeamsN: totalTeams) + Double(allianceCaptainPoints(captianNumber: allianceCaptain)) +
        Double(draftOrderAcceptancePoints(order: draftOrderAcceptance)) +
        Double(playoffAdvancement(allianceFinish: allianceFinish, matchesWon: allianceMatchesWon, winningMatchesPlayed: allianceWinningMatchesPlayed)) +
        Double(awards(awards: awardsWon)) +
        Double(teamAgeBonus(ageBonus: teamAge))
}

// 0 - none, 1 - 2024 (5pts), 2 - 2025 (10pts)
func teamAgeBonus(ageBonus: Int) -> Int {
    switch ageBonus {
    case 1:
        return 5
    case 2:
        return 10
    case _:
        return 0
    }
}

// 0 - none, 1 - other, 2 - rookie all star, 3 - engineering inspiration, 4 - impact
func awards(awards: Int) -> Int {
    switch awards {
    case 1:
        return 5
    case 2:
        return 8
    case 3:
        return 28
    case 4:
        return 45
    case _:
        return 0
    }
}

func playoffAdvancement(allianceFinish: Int, matchesWon: Int, winningMatchesPlayed: Int) -> Int {
    if matchesWon != 0 {
        let playedPercentage: Double = Double(winningMatchesPlayed) / Double(matchesWon)
        let points: Double = playedPercentage * Double(allianceFinish)
        
        return Int(points.rounded())
    } else { return 0 }
}

func draftOrderAcceptancePoints(order: Int) -> Int {
    return order == 0 ? 0 : (17 - order) > 0 ? 17 - order : 0
}

func allianceCaptainPoints(captianNumber: Int) -> Int {
    return captianNumber == 0 ? 0 : 17 - captianNumber
}

func qualificationPoints(finalRankR: Int, totalTeamsN: Int) -> Double {
    let firstShit: Double = ((Double(totalTeamsN) - (2.0 * Double(finalRankR)) + 2.0) / (Double(totalTeamsN) * 1.07))
    let secondShit: Double = (10 / inverf(y: (1 / 1.07)))
    
    return ((inverf(y: firstShit) * secondShit) + 12.0)
}

func inverf(y: Double) -> Double {
    let center = 0.7
    let a = [ 0.886226899, -1.645349621,  0.914624893, -0.140543331]
    let b = [-2.118377725,  1.442710462, -0.329097515,  0.012229801]
    let c = [-1.970840454, -1.624906493,  3.429567803,  1.641345311]
    let d = [ 3.543889200,  1.637067800]
    if abs(y) <= center {
        let z = pow(y, 2)
        let num = (((a[3] * z + a[2]) * z + a[1]) * z) + a[0]
        let den = ((((b[3] * z + b[2]) * z + b[1]) * z + b[0]) * z + 1.0)
        var x = y * num / den
        x = x - (erf(x) - y) / (2.0 / sqrt(.pi) * exp(-x * x))
        x = x - (erf(x) - y) / (2.0 / sqrt(.pi) * exp(-x * x))
        return x
    }
    else if abs(y) > center && abs(y) < 1.0 {
        let z = pow(-log((1.0-abs(y))/2), 0.5)
        let num = ((c[3] * z + c[2]) * z + c[1]) * z + c[0]
        let den = (d[1] * z + d[0]) * z + 1
        var x = y / pow(pow(y,2),0.5) * num / den
        x = x - (erf(x) - y) / (2.0 / sqrt(.pi) * exp(-x * x))
        x = x - (erf(x) - y) / (2.0 / sqrt(.pi) * exp(-x * x))
        return x
    } else if abs(y) == 1 {
        return y * Double(Int.max)
    } else {
        return .nan
    }
}

#Preview {
    RegionalPoints()
}
