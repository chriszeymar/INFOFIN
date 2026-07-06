using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class OdooJournalLineService : IOdooJournalLineService
    {
        private readonly IOdooJournalLineRepository _repo;
        public OdooJournalLineService(IOdooJournalLineRepository repo)
        {
            _repo = repo;
        }

        public async Task DelOdooJournalLineHrd(int id)
        {
            await _repo.DelOdooJournalLineHrd(id);
        }

        public async Task DelOdooJournalLineSft(int id)
        {
            await _repo.DelOdooJournalLineSft(id);
        }

        public async Task<List<InfoFin.Model.OdooJournalLine>> GetOdooJournalLineById(int? id, bool? isActive)
        {
            return await _repo.GetOdooJournalLineById(id, isActive);
        }

        public async Task<List<InfoFin.Model.OdooJournalLine>> GetOdooJournalLineByIds(List<int> ids)
        {
            return await _repo.GetOdooJournalLineByIds(ids);
        }

        public async Task<List<InfoFin.Model.OdooJournalLine>> GetOdooJournalLineByOdooLineId(int? odooLineId)
        {
            return await _repo.GetOdooJournalLineByOdooLineId(odooLineId);
        }

        public async Task<InfoFin.Model.OdooJournalLine> InsUpdOdooJournalLine(InfoFin.Model.OdooJournalLine odooJournalLine)
        {
            return await _repo.InsUpdOdooJournalLine(odooJournalLine);
        }
    }
}