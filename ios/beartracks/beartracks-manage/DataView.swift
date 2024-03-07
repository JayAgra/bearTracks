//
//  DataView.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/15/24.
//

import SwiftUI

struct DataView: View {
  @ObservedObject var dataItems: DataViewModel = DataViewModel()
  @State private var showSheet: Bool = false
  @State private var lastDeletedIndex: Int?
  @State private var lastDeletedId: String = "-1"
  @State private var showConfirmDialog: Bool = false

  var body: some View {
    VStack {
      NavigationStack {
        if !dataItems.dataEntries.isEmpty {
          List {
            ForEach(dataItems.dataEntries, id: \.Brief.id) { entry in
              VStack {
                HStack {
                  Text("\(String(entry.Brief.team))")
                    .font(.title)
                    .padding(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                  Text("match \(String(entry.Brief.match_num))")
                    .font(.title)
                    .padding(.trailing)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                }
                HStack {
                  Text(
                    "#\(String(entry.Brief.id)) • from \(String(entry.Brief.from_team)) (\(entry.Brief.name))"
                  )
                  .padding(.leading)
                  .frame(maxWidth: .infinity, alignment: .leading)
                }
              }
              .contentShape(Rectangle())
              .onTapGesture {
                dataItems.setSelectedItem(item: String(entry.Brief.id))
                showSheet = true
              }
            }
            .onDelete { indexSet in
              lastDeletedIndex = Array(indexSet).max()
              lastDeletedId = String(dataItems.dataEntries[lastDeletedIndex ?? 0].Brief.id)
              showConfirmDialog = true
            }
          }
          .navigationTitle("Data")
          .alert(isPresented: $showConfirmDialog) {
            Alert(
              title: Text("Delete Submission \(self.lastDeletedId)"),
              message: Text(
                "are you sure you would like to delete the data? this action is irreversable."),
              primaryButton: .destructive(Text("Delete")) {
                dataItems.deleteSubmission(id: lastDeletedId)
              },
              secondaryButton: .cancel()
            )
          }
        } else {
          VStack {
            Text("no data")
              .padding(.bottom)
          }
          .navigationTitle("Data")
        }
      }
      .refreshable {
        dataItems.reload()
      }
      .onAppear {
        dataItems.reload()
      }
    }
    .sheet(
      isPresented: $showSheet,
      onDismiss: {
        showSheet = false
      },
      content: {
        DetailedView(model: dataItems)
      })
  }
}

#Preview {
  DataView()
}

struct DetailSheetConfig {
  var selectedId: String = "-1"
  var showSheet = false

  mutating func selectId(id: String) {
    selectedId = id
    showSheet = true
  }

  mutating func deselect() {
    selectedId = "-1"
    showSheet = false
  }
}
