using InfoFin.Model;

namespace InfoFin.Dal.Interface
{
    public partial interface IOdooJournalLineRepository
    {
        Task DelOdooJournalLineHrd(int id);
        Task DelOdooJournalLineSft(int id);
        Task<List<InfoFin.Model.OdooJournalLine>> GetOdooJournalLineById(int? id, bool? isActive);
        Task<List<InfoFin.Model.OdooJournalLine>> GetOdooJournalLineByIds(List<int> ids);
        Task<List<InfoFin.Model.OdooJournalLine>> GetOdooJournalLineByOdooLineId(int? odooLineId);
        Task<InfoFin.Model.OdooJournalLine> InsUpdOdooJournalLine(InfoFin.Model.OdooJournalLine odooJournalLine);
    }
}