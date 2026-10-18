import React, { useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { PlusIcon } from "../components/ui/Icons";
import { SHP_DATASET } from "../data/shipmentsData";
import type { AdminShipment } from "../types";

export const ShipmentsManager: React.FC = () => {
  const [shipments, setShipments] = useState<AdminShipment[]>(() =>
    SHP_DATASET.map((s) => ({
      ...s,
      status: "Active",
    }))
  );

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Add
  const [newId, setNewId] = useState("");
  const [newOrigin, setNewOrigin] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newWeight, setNewWeight] = useState(500);
  const [newWindow, setNewWindow] = useState(7);
  const [newCargo, setNewCargo] = useState("High-Priority Freight");

  const filtered = shipments.filter((s) => {
    const matchesSearch =
      s.shipment_id.toLowerCase().includes(search.toLowerCase()) ||
      s.origin_name.toLowerCase().includes(search.toLowerCase()) ||
      s.destination_name.toLowerCase().includes(search.toLowerCase()) ||
      s.cargo_description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === "ALL" || s.use_case_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newOrigin || !newDest) return;

    const created: AdminShipment = {
      shipment_id: newId,
      use_case_type: "Commercial_Custom",
      origin_name: newOrigin,
      origin_circuit: `${newOrigin} Freight Hub`,
      origin_facility: `${newOrigin} Logistics Depot`,
      origin_country: "Custom",
      origin_region: "Global",
      destination_name: newDest,
      destination_circuit: `${newDest} Port Terminal`,
      destination_facility: `${newDest} Receiving Facility`,
      destination_country: "Custom",
      destination_region: "Global",
      cargo_weight_tonnes: Number(newWeight),
      cargo_description: newCargo,
      departure_date: new Date().toISOString().split("T")[0],
      delivery_deadline: new Date(Date.now() + newWindow * 86400000).toISOString().split("T")[0],
      available_window_days: Number(newWindow),
      status: "Active",
    };

    setShipments([created, ...shipments]);
    setIsAddModalOpen(false);
    setNewId("");
    setNewOrigin("");
    setNewDest("");
  };

  const handleToggleStatus = (id: string) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.shipment_id === id
          ? { ...s, status: s.status === "Active" ? "Suspended" : "Active" }
          : s
      )
    );
  };

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Freight Corridors Manager</h1>
          <p className="admin-page-sub">
            Manage monitored shipping corridors, adjust cargo parameters, and update delivery SLA windows.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusIcon size={16} />
            <span>Add New Corridor</span>
          </button>
        </div>
      </div>

      <Card
        title={`Monitored Corridors (${filtered.length} of ${shipments.length})`}
        subtitle="Audited dataset v2.1.1 baseline with runtime administrative overrides"
        headerAction={
          <div className="admin-filter-bar">
            <input
              type="text"
              placeholder="Search by ID, Origin, Destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input-search"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Corridor Types</option>
              <option value="F1_Demonstration">F1 Calendar Corridors</option>
              <option value="Commercial_General">Commercial Corridors</option>
              <option value="Commercial_Custom">Custom Admin Corridors</option>
            </select>
          </div>
        }
      >
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Corridor ID</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Cargo Weight</th>
                <th>SLA Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.shipment_id}>
                  <td>
                    <code>{s.shipment_id}</code>
                  </td>
                  <td>
                    <strong>{s.origin_name}</strong>
                    <div className="admin-table-sub">{s.origin_country}</div>
                  </td>
                  <td>
                    <strong>{s.destination_name}</strong>
                    <div className="admin-table-sub">{s.destination_country}</div>
                  </td>
                  <td>{s.cargo_weight_tonnes?.toLocaleString()} tonnes</td>
                  <td>
                    <strong>{s.available_window_days} days</strong>
                    <div className="admin-table-sub">{s.delivery_deadline}</div>
                  </td>
                  <td>
                    <Badge variant={s.status === "Active" ? "good" : "bad"}>
                      {s.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-btn-table"
                        onClick={() => handleToggleStatus(s.shipment_id)}
                      >
                        {s.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Shipment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Freight Corridor"
      >
        <form onSubmit={handleAddShipment} className="admin-form">
          <div className="admin-form-group">
            <label>Corridor Identifier (e.g. COM-05)</label>
            <input
              type="text"
              required
              placeholder="e.g. COM-05"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Origin City</label>
              <input
                type="text"
                required
                placeholder="e.g. Hamburg"
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="admin-form-group">
              <label>Destination City</label>
              <input
                type="text"
                required
                placeholder="e.g. Singapore"
                value={newDest}
                onChange={(e) => setNewDest(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Cargo Weight (Tonnes)</label>
              <input
                type="number"
                required
                min={1}
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                className="admin-input"
              />
            </div>
            <div className="admin-form-group">
              <label>SLA Allowed Window (Days)</label>
              <input
                type="number"
                required
                min={1}
                value={newWindow}
                onChange={(e) => setNewWindow(Number(e.target.value))}
                className="admin-input"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Cargo Description</label>
            <input
              type="text"
              value={newCargo}
              onChange={(e) => setNewCargo(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary">
              Register Corridor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
