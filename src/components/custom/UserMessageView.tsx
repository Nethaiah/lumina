import { Message } from "@/api/types";

const UserMessageView = ({ m }: { m: Message }) => {
  return <div className="bg-background">{m.content}</div>;
};

export default UserMessageView;
