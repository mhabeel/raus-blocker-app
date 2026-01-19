
export type Blocker = {
  id: string;
  startDate: string; 
  endDate: string;   
  reason: string;
  status: "OutOfInventory" | "OutOfOrder";
  createdAt: string; 
};
