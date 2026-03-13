import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { CalendarIcon, BookIcon } from "@/components/icons";
import { DashboardCampaign } from "@/domain/dashboard/dashboard";
import { formatDate } from "@/utils/formatDate";
import { STATUS_COLOR } from "@/constants/ui";

interface RecentCampaignsProps {
  initialData: DashboardCampaign[];
}

export function RecentCampaigns({ initialData }: RecentCampaignsProps) {
  const campaigns = initialData ?? [];

  if (campaigns.length === 0) {
    return (
      <Card className="bg-zinc-800 border border-zinc-700">
        <CardBody>
          <p className="text-zinc-500 text-center">No hay campañas todavía</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="bg-zinc-800 border border-zinc-700">
          <CardHeader className="flex items-center justify-between pb-2">
            <h3 className="text-white font-semibold">{campaign.name}</h3>
            <Chip
              size="sm"
              color={STATUS_COLOR[campaign.status]}
              variant="flat"
            >
              {campaign.status}
            </Chip>
          </CardHeader>
          <CardBody className="pt-0 text-sm text-zinc-400">
            <p>Grupo: {campaign.groupName}</p>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1">
                <BookIcon size={14} />
                {campaign.sessions} sesiones
              </span>
              {campaign.nextSessionAt && (
                <span className="flex items-center gap-1">
                  <CalendarIcon size={14} />
                  {formatDate(campaign.nextSessionAt)}
                </span>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
